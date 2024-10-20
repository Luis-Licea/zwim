import process from 'node:process';
// Import environment variables to use in paths.
const { HOME, XDG_CACHE_HOME, XDG_DATA_HOME } = process.env;

// The directory where dictionaries will be downloaded.
// You could change it to ${HOME}/Documents/Zwim, for example.
export const downloadDirectory = `${XDG_DATA_HOME ?? `${HOME}/.local/share`}/zwim`;
export const cache = `${XDG_CACHE_HOME ?? `${HOME}/.cache`}/zwim`;

// The URL from which the dictionaries will be downloaded.
// You can download more dictionaries from these websites:
// https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/
// https://ftp.fau.de/kiwix/zim/wiktionary/
// https://ftp.nluug.nl/kiwix/zim/wiktionary/
export const wiktionaryUrl = 'https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/';

// The dictionaries for "view", "alter", "save", "alter-save", and "search".
// Files will be looked for in the downloadDirectory.
export const dictionaries = {
    // English
    en: /wiktionary_en.*\.zim/,
    // Spanish
    es: /wiktionary_es.*\.zim/,
    // Japanese
    ja: /wiktionary_ja.*\.zim/,
    // Russian
    ru: /wiktionary_ru.*\.zim/,
};

// The dictionaries to include in "view-all" and "alter-all" results.
// The entries correspond to dictionary names.
export const relevantDictionaries = [
    'en',
    'ru',
];

// The translations to keep in "alter" and "alter-all" results.
//
// Language codes: https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
export const relevantTranslations = [
    'cu', // Church Slavonic
    'el', // Greek
    'en', // English
    'eo', // Esperanto
    'es', // Spanish
    'ja', // Japanese
    'la', // Latin
    'ru', // Russian
];
