import { env } from 'node:process';
import { existsSync, mkdirSync } from 'node:fs';
import { readdir } from 'node:fs/promises';

const { HOME, XDG_CACHE_HOME, XDG_CONFIG_HOME, XDG_DATA_HOME, ZWIM_CONFIGURATION } = env;

export class File {
    static settings = ZWIM_CONFIGURATION ?? `${XDG_CONFIG_HOME ?? `${HOME}/.config`}/zwim/zwim.mjs`;
    #downloadDirectory = `${XDG_DATA_HOME ?? `${HOME}/.local/share`}/zwim`;
    #cache = `${XDG_CACHE_HOME ?? `${HOME}/.cache`}/zwim`;
    // static data = XDG_DATA_HOME ?? `${HOME}/.local/share`;

    /**
     * @param {import("../configuration/zwim.mjs")} settings
     */
    constructor({ downloadDirectory, cache, wiktionaryUrl, dictionaries, relevantDictionaries, relevantTranslations }) {
        this.settings = File.settings;
        this.defaultSettings = `${import.meta.dirname}/../configuration/zwim.yml`;
        this.languageListHtml = `${this.#cache}/dumps.wikimedia.org.html`;
        this.languageListJson = `${this.#cache}/dumps.wikimedia.org.json`;
        this.downloadDirectory = downloadDirectory;
        this.cache = cache;
        this.wiktionaryUrl = new URL(wiktionaryUrl);
        this.dictionaries = dictionaries;
        this.relevantDictionaries = relevantDictionaries;
        this.relevantTranslations = relevantTranslations;
        if (!existsSync(this.downloadDirectory)) {
            if (this.downloadDirectory === this.#downloadDirectory) {
                mkdirSync(this.downloadDirectory);
            } else {
                throw Error(`The download directory defined in ${File.settings} does not exist`, { cause: { downloadDirectory } });
            }
        }
        if (!existsSync(this.cache)) {
            if (this.cache === this.#cache) {
                mkdirSync(this.cache);
            } else {
                throw Error(`The download directory defined in ${File.settings} does not exist`, { cause: { cache } });
            }
        }
        if (typeof this.dictionaries !== 'object') {
            throw Error('Expected an object', { cause: { dictionaries, type: typeof dictionaries } });
        }
        if (!Array.isArray(this.relevantDictionaries)) {
            throw Error('Expected an array', { cause: { find, type: typeof find } });
        }
        if (!Array.isArray(this.relevantTranslations)) {
            throw Error('Expected an array', { cause: { relevantTranslations, type: typeof relevantTranslations } });
        }
        for (const dictionary of this.relevantDictionaries) {
            if (!(dictionary in this.dictionaries)) {
                throw Error(`Unknown dictionary: ${dictionary}`, { cause: { dictionary, dictionaries } });
            }
        }
    }

    /**
     * Return the dictionaries according to the given language.
     *
     * @param {[string]} languages The languages for which to get the dictionary.
     * @returns {Promise<{[language: string]: string}>} Return the dictionaries.
     */
    async getDictionary(languages) {
        const dictionary = {};
        for (const language of languages) {
            const fileName = this.dictionaries[language];
            if (!fileName) {
                continue;
            }
            if (fileName instanceof RegExp) {
                const files = await readdir(this.downloadDirectory, { withFileTypes: true });
                dictionary[language] = files.filter(it => fileName.test(it.name) && it.isFile()).map(it => `${it.parentPath}/${it.name}`).shift();
            } else if (typeof fileName === 'string') {
                dictionary[language] = `${this.downloadDirectory}/${fileName}`;
            } else {
                throw Error('Expected a regular expression or a string', {
                    cause: { cause: { [File.settings]: { dictionaries: this.dictionaries, [language]: fileName } } }
                });
            }
        }
        if (!Object.keys(dictionary).length) {
            throw Error(`There are no valid dictionaries associated to ${JSON.stringify(languages)}`, {
                cause: { [File.settings]: { dictionaries: this.dictionaries }, languages }
            });
        }
        return dictionary;
    }
}

const settings = await import(File.settings);

export default new File(settings);
