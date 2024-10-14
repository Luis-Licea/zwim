import File from '../library/file.mjs';
import command from '../library/command.mjs';
import scrape from '../library/download.mjs';
import { access, mkdir, readFile, stat, cp, chmod } from 'node:fs/promises';
import { filterLanguages } from './filterLanguages.mjs';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';

export default {
    /**
     * Copy the file from the source to the destination path. Existing files will
     * not be overwritten.
     */
    copyConfig: async function() {
        if (existsSync(File.settings)) {
            throw Error(`Destination file alrady exists: ${File.settings}`);
        }
        await cp(File.defaultSettings, File.settings, { recursive: true, errorOnExist: true });
        await chmod(File.settings, 0o622);
    },
    findConfig: function() {
        console.log(File.settings);
    },
    alter: function(language, words) {
        return this.view(language, words, true);
    },
    alterAll: function(words) {
        const dictionaries = File.getDictionary(File.find);
        return command.view(dictionaries, words, true);
    },
    view: async function(language, words, alter = false) {
        const dictionaries = File.getDictionary([language]);
        await command.view(dictionaries, words, alter);
    },
    viewAll: async function(words) {
        const dictionaries = File.getDictionary(File.find);
        await command.view(dictionaries, words, false);
    },
    dictionarySearch: async function(languages) {
        const status = await stat(File.languageListJson).catch(() => null);
        // Update if more than a week old.
        const oneWeek = Date.UTC(0, 0, 7);
        const isOneWeekOld = Date.now() > status?.mtime + oneWeek;
        if (!status || isOneWeekOld) {
            if (isOneWeekOld) {
                console.log('Dictionary index is more than one week old.');
            }
            console.log(`Fetching ${File.wiktionaryUrl}`);
            await command.fetchDocument(File.wiktionaryUrl, File.languageListHtml);
            const entries = await scrape(File.languageListHtml);
            console.log(`Saving ${File.languageListJson}`);
            await command.saveJson(entries, File.languageListJson);
        }

        const dictionaryUrls = JSON.parse(await readFile(File.languageListJson));

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
            console.dir(availableDictionaries);
        } else {
            const keys = Object.keys(dictionaries).sort(collator);
            console.dir(keys, { maxArrayLength: Number.MAX_VALUE });
        }
    },
    dictionaryDownload: async function(urls) {
        await access(File.downloadDirectory).catch(() => mkdir(File.downloadDirectory, { recursive: true }));
        for (const url of urls) {
            console.log(`Downloading to ${JSON.stringify(File.downloadDirectory)}: ${JSON.stringify(url)}`);
            await command.downloadFile(`${File.downloadDirectory}/${basename(url)}`, url);
        }
    },
    search: async function(language, words, number = undefined) {
        const dictionaries = File.getDictionary([language]);
        const similarWords = await command.search(dictionaries[language], words);
        console.dir(similarWords.slice(0, number), { maxArrayLength: Number.MAX_VALUE });
    },
    output: async function(path, language, words) {
        const zimFile = File.getDictionary([language]);
        return command.documentLoad(path, zimFile[language], words);
    },
    outputAlter: async function(path, language, words) {
        await this.output(path, language, words);
        await filterLanguages(path);
    },
};
