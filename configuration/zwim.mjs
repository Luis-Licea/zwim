import { env } from 'node:process';
// Import environment variables to use in paths.
const { HOME,XDG_CACHE_HOME, XDG_DATA_HOME } = env;

// The directory where dictionaries will be downloaded.
// This is ~/Documents/Zict by default but you can change it.
export const downloadDirectory = `${XDG_DATA_HOME ?? `${HOME}/.local/share`}/zwim`;
export const cache = `${XDG_CACHE_HOME ?? `${HOME}/.cache`}/zwim`;

// The URL from which the dictionaries will be downloaded.
// You can download more dictionaries from these websites:
// https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/
// https://ftp.fau.de/kiwix/zim/wiktionary/
// https://ftp.nluug.nl/kiwix/zim/wiktionary/
export const wiktionaryUrl = 'https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/';

// The dictionaries to use for finding word definitions. The first existing file
// will be used.
export const files = {
    en: [
        `${HOME}/Documents/Zict/wiktionary_en_all_maxi_2022-09.zim`,
    ],
    ru: [
        `${HOME}/Documents/Zict/wiktionary_ru_all_maxi_2022-08.zim`,
    ],
    es: [
        `${HOME}/Documents/Zict/wiktionary_es_all_maxi_2023-01.zim`,
    ],
    ja: [
        `${HOME}/Documents/Zict/wiktionary_ja_all_maxi_2022-12.zim`,
    ],
};

// The languages to include in "find" results.
export const find = [
    'en',
    'ru',
    'ja',
];
