import File from '../library/file.mjs';
import dependencies from './dependencies.mjs';
import http from 'node:http';
import https from 'node:https';
import scrapeDownloadLinks from './scrapeDownloadLinks.mjs';
import { basename, dirname } from 'node:path';
import { execFileSync, spawnSync, execSync } from 'node:child_process';
import { filterLanguages } from './filterLanguages.mjs';
import { readFile, stat, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { rmSync, existsSync, createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';

/**
 * @param {string} command The command to execute.
 * @returns {string} The command output.
 */
function exec(command) {
    return execSync(command, { encoding: 'utf8', shell: true });
}

/**
 * Download a given URL into the given path without overwriting files.
 *
 * @param {string} downloadPath The path where to download the file.
 * @param {string} downloadUrl The URL of the file to download.
 */
export async function downloadFile(downloadPath, downloadUrl) {
    if (!downloadPath || !downloadUrl) {
        throw Error('Missing arguments', { cause: { downloadPath, downloadUrl } });
    }
    const path = await stat(downloadPath).catch(() => null);
    if (!path || path.isFile()) {
        // Start or continue the download.
        await getRemoteFile(downloadPath, downloadUrl);
    } else if (path.isDirectory()) {
        // Start the download using the file name from the download URL.
        return await downloadFile(`${downloadPath}/${basename(downloadUrl)}`, downloadUrl);
    } else {
        throw Error('The path exists and is neither a file nor a directory', { cause: { downloadPath, downloadUrl } });
    }
}

async function getRemoteFile(filePath, url) {
    const { options, size } = await stat(filePath)
        .then(status => ({
            options: {
                headers: {
                    'accept-ranges': 'arraybuffer',
                    'response-yype': 'arraybuffer',
                    range: `bytes=${status.size}-${Number.MIN_SAFE_INTEGER},`
                },
            },
            size: status.size
        }), () => ({ options: { headers: {} }, size: 0, }));
    const byteCountFormatter = Intl.NumberFormat(undefined, {
        notation: 'compact',
        compactDisplay: 'short',
        style: 'unit',
        unit: 'byte',
        unitDisplay: 'narrow',
    });

    const controller = new AbortController();
    options.signal = controller.signal;
    const client = url.startsWith('https') ? https : http;
    return new Promise((resolve, reject) => {
        client.get(url, options, (response) => {
            const totalBytes = parseInt(response.headers['content-length']);
            if (totalBytes === size) {
                controller.abort();
                reject(new Error('The file has been downloaded already.'));
            } else {
                // For some reason this code will not work if it is not placed
                // under an else statement: the createWriteStream function may
                // be called when it should not.
                const file = createWriteStream(filePath, {});
                const totalBytesString = byteCountFormatter.format(totalBytes).replace('BB', 'GB');
                response.pipe(file);
                response.on('data', () => {
                    if (process.stderr.isTTY) {
                        const bytes = file.bytesWritten + file.writableLength;
                        const bytesString = byteCountFormatter.format(bytes).replace('BB', 'GB');
                        const progress = (100 * bytes / totalBytes).toFixed(2);
                        process.stdout.write('\r');
                        process.stderr.write(`Progress: ${progress}% (${bytesString}/${totalBytesString})`);
                    }
                });
                response.on('end', () => {
                    console.log(); // Print newline after "progress" message.
                    resolve();
                });
            }
        });
    });
}

/**
 * Save the zim file entry definition into a temporary file. This function is
 * also responsible for cleaning up the temporary file before exiting.
 *
 * @param {{[string: language]: string}} zimFiles The zim file from which to retrieve the definition.
 * @param {string[]} phrase The phrase to load.
 * @param {string[]?} relevantTranslations The translations to keep. Pass null
 * to keep all translations.
 * @param {string} [prefix='zwim'] The temporary directory to use.
 */
export async function view(zimFiles, phrase, relevantTranslations = null, prefix = 'zwim') {
    // Temporary directory for storing the definition.
    const folderPrefix = `${tmpdir()}/${prefix}-`;
    const temporaryFolder = await mkdtemp(folderPrefix).then(
        (path) => path,
        () => null,
    );
    if (!temporaryFolder) {
        console.error('Failed to create temporary directory.');
        process.exit(1);
    }
    // Remove the file when exiting the process.
    process.on('exit', () => rmSync(temporaryFolder, { recursive: true }));

    const pages = [];
    const suggestions = [];
    for (const zimFile in zimFiles) {
        const [page, phraseSuggestions] = await documentLoad(`${temporaryFolder}/${zimFile}.html`, zimFiles[zimFile], phrase);
        if (!page) {
            suggestions[zimFile] = phraseSuggestions;
            continue;
        }
        if (relevantTranslations !== null) {
            await filterLanguages(page, null, relevantTranslations);
        }
        pages.push(page);
    }
    if (Object.keys(suggestions).length) {
        console.dir(suggestions, { depth: null, maxArrayLength: Number.MAX_VALUE });
    }
    if (pages.length) {
        documentView(pages);
    }
}

/**
 * Save the zim file entry definition into a temporary file.
 *
 * @param {string} tempFile The file in which to save the entry.
 * @param {string} zimFile The zim file from which to retrieve the definition.
 * @param {string[]|number} phraseOrIndex The phrase to load or the phrase's index number in the file.
 * @returns {Promise<string?, string[]>} The path to the saved search result, or
 * suggestions for similar words.
 */
export async function documentLoad(tempFile, zimFile, phraseOrIndex) {
    if (!tempFile || !zimFile || !phraseOrIndex) {
        throw Error('Missing arguments', { cause: { tempFile, zimFile, phraseOrIndex } });
    }
    const idxOrUrl = typeof phraseOrIndex === 'number' ? `--idx=${phraseOrIndex}` : `--url=${phraseOrIndex.join('_')}`;
    const showArgs = ['show', idxOrUrl, zimFile];
    // Retrieve definition. Replace all phrase spaces with underscores.
    const output = spawnSync(dependencies.zimdump, showArgs, { encoding: 'utf8' });
    if (output.status) {
        if (output.stderr.startsWith('Entry') && output.stderr.endsWith('is a redirect.\n')) {
            const redirectIndex = getRedirectIndex(phraseOrIndex, zimFile);
            return await documentLoad(tempFile, zimFile, redirectIndex);
        } else if (output.stderr.includes('Entry not found')) {
            const suggestions = await search(zimFile, phraseOrIndex);
            return [null, suggestions];
        } else {
            console.error(output.stderr.trimEnd());
            throw Error('Failed to run zimdump', { cause: [dependencies.zimdump, ...showArgs] });
        }
    }
    return await writeFile(tempFile, output.stdout).then(() => [tempFile, []]);
}

/**
 * Return the phrase index in the Zim file.
 *
 * @param {string[]} phrase The phrase whose index to return.
 * @param {string} zimFile The zim in which to lookup the index.
 * @returns {number} The phrase's index in the Zim file.
 */
function getRedirectIndex(phrase, zimFile) {
    const url = `--url=${phrase.join('_')}`;
    const listArgs = ['list', url, zimFile];
    const list = spawnSync(dependencies.zimdump, listArgs, { encoding: 'utf8' });
    const redirectIndexString = '* redirect index: ';
    const stringIndex = list.stdout.indexOf(redirectIndexString);
    return parseInt(list.stdout.slice(stringIndex).slice(redirectIndexString.length));
}

const keyboardLayout = {
    hyprctl: {
        getLayout: () => JSON.parse(exec('hyprctl getoption input:kb_layout -j')).str,
        setEnglish: () => exec('hyprctl keyword input:kb_layout us'),
        setLayout: (layout) => exec(`hyprctl keyword input:kb_layout ${layout}`),
    },
    fcitx5: {
        getLayout: () => execFileSync(dependencies.fcitx5remote, ['-q']),
        setEnglish: () => execFileSync(dependencies.fcitx5remote, ['-g', 'English']),
        setLayout: (layout) => execFileSync(dependencies.fcitx5remote, ['-g', layout]),
    }
};

/**
 * View the file contents.
 *
 * @param {string[]} tempFiles The path to the files to view.
 * @param {keyof keyboardLayout} switchMethod The function to use for switching
 * keyboards.
 */
export function documentView(tempFiles, switchMethod = 'hyprctl') {
    // Store current keyboard layout: w3m controls work with a Latin alphabet.
    const layout = keyboardLayout[switchMethod].getLayout();
    // Set keyboard to English so that navigation controls work in w3m.
    keyboardLayout[switchMethod].setEnglish();
    // Display the definition.
    const args = tempFiles.length === 1 ? [tempFiles] : ['-N', ...tempFiles];
    const output = spawnSync(dependencies.w3m, args, { encoding: 'utf8', stdio: 'inherit' });
    // Restore previous keyboard layout.
    keyboardLayout[switchMethod].setLayout(layout);
    if (output.status) {
        throw Error('Error executing w3m', { cause: { output, args } });
    }
}

/**
 * Search a phrase in the given zim file and return similar entries.
 *
 * @param {string} zimFile The zim file in which to search.
 * @param {string[]} phrase The words to look for in the zim file.
 * @returns {Promise<string>}
 */
export async function search(zimFile, phrase) {
    const result = execFileSync(dependencies.zimsearch, [zimFile, phrase.join(' ')], {
        encoding: 'utf8',
    });
    return result
        .split('\n')
        .filter((line) => line.includes(':'))
        .map((line) => line.slice(line.lastIndexOf('\t') + 1));
}

/**
 * @param {object} object The JSON object to save.
 * @param {string} file The path to the file where to save the serialized
 * object.
 */
export async function saveJson(object, file) {
    const directory = dirname(file);
    if (!existsSync(directory)) {
        await mkdir(directory, { recursive: true });
    }
    await writeFile(file, JSON.stringify(object, null, 4));
}

/**
 * @param {string} url The url contents to fetch.
 * @param {string?} savePath The optional path where to save the fetched text.
 * @returns {Promise<string>} The URL contents.
 */
export async function fetchDocument(url, savePath = null) {
    const websiteResponse = await fetch(url);
    const text = await websiteResponse.text();
    if (savePath) {
        const directory = dirname(savePath);
        if (!existsSync(directory)) {
            await mkdir(directory, { recursive: true });
        }
        await writeFile(savePath, text);
    }
    return text;
}


export async function updateDictionaryIndex(File) {
    const status = await stat(File.languageListJson).catch(() => null);
    // Update if more than a week old.
    const oneWeek = Date.UTC(0, 0, 7);
    const isOneWeekOld = Date.now() > status?.mtime + oneWeek;
    if (!status || isOneWeekOld) {
        if (isOneWeekOld) {
            console.log('Dictionary index is more than one week old.');
        }
        console.log(`Fetching ${File.wiktionaryUrl}`);
        await fetchDocument(File.wiktionaryUrl, File.languageListHtml);
        const entries = await scrapeDownloadLinks({ file: File.languageListHtml, url: File.wiktionaryUrl });
        console.log(`Saving ${File.languageListJson}`);
        await saveJson(entries, File.languageListJson);
    }
    return JSON.parse(await readFile(File.languageListJson));
}

/**
 * Search for dictionary URLs to download.
 *
 * @param {string[]} languages The languages to look for, such as 'english'.
 * If langauges are not given, then a list of available languages is
 * returned.
 * @returns {Promise<string[]|{[language: string]: {url: string, date: Date, size: string}}>}
 */
export async function searchDictionary(languages, File) {
    const dictionaryUrls = await updateDictionaryIndex(File);

    // Handle Nahuatl (nah) and Gungbe (guw).
    const nahuatl = 'nah';
    const gungbe = 'guw';
    if (nahuatl in dictionaryUrls) {
        dictionaryUrls['Nahuatl'] = dictionaryUrls[nahuatl];
        delete dictionaryUrls[nahuatl];
    }
    if (gungbe in dictionaryUrls) {
        dictionaryUrls['Gungbe'] = dictionaryUrls[gungbe];
        delete dictionaryUrls[gungbe];
    }

    // Transform en_US.UTF-8 into simply "en-US".
    const localeIso = process.env?.LANG?.split('.')?.shift()?.replace('_', '-') ?? 'en';
    const getLanguageName = new Intl.DisplayNames([localeIso], { type: 'language' });
    const collator = new Intl.Collator(localeIso).compare;
    const byteCountFormatter = Intl.NumberFormat(localeIso, {
        notation: 'compact',
        compactDisplay: 'short',
        style: 'unit',
        unit: 'byte',
        unitDisplay: 'narrow',
    });

    const langaugeNames = Object.keys(dictionaryUrls);
    const dictionaries = {};
    for (const language of langaugeNames) {
        const languageName = getLanguageName.of(language);
        for (const entry of dictionaryUrls[language]) {
            entry.size = byteCountFormatter.format(entry.bytes).replace('BB', 'GB');
            entry.date = new Date(entry.date);

            delete entry.bytes;
            delete entry.language;
            delete entry.languageIso;
            delete entry.rawDate;
            delete entry.basename;
        }
        dictionaries[languageName.toLowerCase()] = dictionaryUrls[language];
    }

    if (languages.length) {
        for (const language of languages) {
            if (!(language in dictionaries)) {
                console.error(`Unknown language: ${language}`);
                console.error('See --help for available languages');
                process.exit(1);
            }
        }
        const availableDictionaries = Object.fromEntries(languages.map(language => [language, dictionaries[language]]));
        return availableDictionaries;
    } else {
        const languageList = Object.keys(dictionaries).sort(collator);
        return languageList;
    }
}
