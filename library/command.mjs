import { mkdir, mkdtemp, writeFile } from 'fs/promises';
import { execFileSync, spawnSync, execSync } from 'child_process';
import { tmpdir } from 'node:os';
import { filterLanguages } from './filterLanguages.mjs';
import { rmSync, existsSync, createWriteStream } from 'fs';
import { basename, dirname } from 'path';
import dependencies from './dependencies.mjs';
import { stat } from 'fs/promises';
import http from 'http';
import https from 'https';

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
async function downloadFile(downloadPath, downloadUrl) {
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
                response.on('end', resolve);
                response.on('data', () => {
                    if (process.stderr.isTTY) {
                        const bytes = file.bytesWritten + file.writableLength;
                        const bytesString = byteCountFormatter.format(bytes).replace('BB', 'GB');
                        const progress = (100 * bytes / totalBytes).toFixed(2);
                        process.stdout.write('\r');
                        process.stderr.write(`Progress: ${progress}% (${bytesString}/${totalBytesString})`);
                    }
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
 * @param {boolean} [postprocess=false] Whether to process the word definition.
 * @param {string} [prefix='zwim'] The temporary directory to use.
 */
async function view(zimFiles, phrase, postprocess = false, prefix = 'zwim') {
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

    const paths = [];
    const suggestion = [];
    for (const zimFile in zimFiles) {
        const [path, suggestions] = await documentLoad(`${temporaryFolder}/${zimFile}.html`, zimFiles[zimFile], phrase);
        if (!path) {
            suggestion[zimFile] = suggestions;
            continue;
        }
        if (postprocess) {
            await filterLanguages(path);
        }
        paths.push(path);
    }
    if (Object.keys(suggestion).length) {
        console.dir(suggestion, { depth: null, maxArrayLength: Number.MAX_VALUE });
    }
    documentView(paths);
}

/**
 * Save the zim file entry definition into a temporary file.
 *
 * @param {string} tempFile The file in which to save the entry.
 * @param {string} zimFile The zim file from which to retrieve the definition.
 * @param {string[]} phrase The phrase to load.
 * @returns {Promise<string?, string[]>} The path to the saved search result, or
 * suggestions for similar words.
 */
export async function documentLoad(tempFile, zimFile, phrase) {
    if (!tempFile || !zimFile || !phrase.length) {
        throw Error('Missing arguments', { cause: { tempFile, zimFile, phrase } });
    }
    const args = ['show', `--url=${phrase.join('_')}`, zimFile];
    // Retrieve definition. Replace all phrase spaces with underscores.
    const output = spawnSync(dependencies.zimdump, args, { encoding: 'utf8' });
    if (output.status) {
        if (output.stderr.includes('Entry not found')) {
            const suggestions = await search(zimFile, phrase);
            return [null, suggestions];
        } else {
            console.error(output.stderr.trimEnd());
            throw Error('Failed to run zimdump', { cause: [dependencies.zimdump, ...args] });
        }
    }
    return await writeFile(tempFile, output.stdout).then(() => [tempFile, []]);
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
function documentView(tempFiles, switchMethod = 'hyprctl') {
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
async function search(zimFile, phrase) {
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

export default {
    documentLoad,
    downloadFile,
    fetchDocument,
    view,
    saveJson,
    search,
};
