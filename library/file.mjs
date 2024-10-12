import { env } from "node:process";
import { existsSync } from "node:fs";

const { HOME, XDG_CACHE_HOME, XDG_CONFIG_HOME, ZWIM_CONFIGURATION } = env;

export default class File {
    // static get data() {
    //     return XDG_DATA_HOME ?? `${HOME}/.local/share`;
    // }
    static get cache() {
        return `${XDG_CACHE_HOME ?? `${HOME}/.cache`}/zwim`;
    }
    static get customSettings() {
        return ZWIM_CONFIGURATION ?? `${XDG_CONFIG_HOME ?? `${HOME}/.config`}/zwim/zwim.mjs`;
    }
    static get defaultSettings() {
        return `${import.meta.dirname}/../configuration/zwim.yml`;
    }
    static get settings() {
        return existsSync(File.customSettings) ? File.customSettings : File.defaultSettings;
    }
    static get languageListHtml() {
        return `${File.cache}/dumps.wikimedia.org.html`;
    }
    static get languageListJson() {
        return `${File.cache}/dumps.wikimedia.org.json`;
    }
    /**
     * Return the dictionaries according to the given language.
     *
     * @param {string|"find"} language The language for which to get the dictionary.
     * @returns {Promise<string[]>} Return the dictionaries.
     */
    static async getDictionary(language) {
        const configuration = await import(File.settings);
        if (language == "find") {
            return configuration.find.map((languageToFind) => configuration.files[languageToFind].filter(existsSync).shift())
        }
        const files = configuration.files[language];
        if (!files?.length) {
            throw Error(`There is no dictionary associated to ${JSON.stringify(language)}`, {
                cause: { [File.settings]: { [language]: undefined, ...configuration.files } }
            });
        }
        return files.filter(existsSync).shift();
    }
}
