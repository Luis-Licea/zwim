import File from '../library/file.mjs';
import { view, downloadFile, documentLoad, search, searchDictionary } from '../library/command.mjs';
import { cp, chmod } from 'node:fs/promises';
import { filterLanguages } from './filterLanguages.mjs';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';

export default {
    alter: function(language, words) {
        return this.view(language, words, File.relevantTranslations);
    },
    alterAll: async function(words) {
        const dictionaries = await File.getDictionary(File.relevantDictionaries);
        return view(dictionaries, words, File.relevantTranslations);
    },
    alterSave: async function(path, language, words) {
        await this.save(path, language, words);
        await filterLanguages(path);
    },
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
    downloadDictionary: async function(urls) {
        for (const url of urls) {
            console.log(`Downloading to ${JSON.stringify(File.dataHome)}: ${JSON.stringify(url)}`);
            await downloadFile(`${File.dataHome}/${basename(url)}`, url);
        }
    },
    findConfig: function() {
        console.log(File.settings);
    },
    save: async function(path, language, words) {
        const zimFile = await File.getDictionary([language]);
        return documentLoad(path, zimFile[language], words);
    },
    search: async function(language, words, number = undefined) {
        const dictionaries = await File.getDictionary([language]);
        const similarWords = await search(dictionaries[language], words);
        const matches = similarWords.slice(0, number);
        console.dir(matches, { maxArrayLength: Number.MAX_VALUE });
        return matches;
    },
    searchDictionary: async function(languages) {
        const result = await searchDictionary(languages, File);
        console.dir(result, { maxArrayLength: Number.MAX_VALUE, maxStringLength: Number.MAX_VALUE });
        return result;
    },
    view: async function(language, words, relevantTranslations = null) {
        const dictionaries = await File.getDictionary([language]);
        await view(dictionaries, words, relevantTranslations);
    },
    viewAll: async function(words) {
        const dictionaries = await File.getDictionary(File.relevantDictionaries);
        await view(dictionaries, words, null);
    },
};
