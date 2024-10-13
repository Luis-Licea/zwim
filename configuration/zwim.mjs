import { env } from 'node:process';
import { basename } from 'node:path';

// Import environment variables to use in paths.
const { XDG_DATA_HOME, HOME } = env;

// The directory where dictionaries will be downloaded.
// This is ~/Documents/Zict by default but you can change it.
export const downloadDirectory = `${XDG_DATA_HOME ?? `${HOME}/.local/share`}/zwim`;

// The URLs from which the dictionaries will be downloaded.
// You can download more dictionaries from these websites:
// https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/
// https://ftp.fau.de/kiwix/zim/wiktionary/
// https://ftp.nluug.nl/kiwix/zim/wiktionary/
export const downloadUrls = {
    // The English Wiktionary weighs about 7GB.
    en: 'https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_en_all_maxi_2023-10.zim',
    // The Spanish Wiktionary weighs about 700MB.
    es: 'https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_es_all_maxi_2023-10.zim',
    // The Japanese Wiktionary weighs about 400MB.
    ja: 'https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_ja_all_maxi_2023-10.zim',
    // The Russian Wiktionary weighs about 2GB.
    ru: 'https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_ru_all_maxi_2023-11.zim',
};

// The dictionaries to use for finding word definitions. The first existing file
// will be used.
export const files = {
    en: [
        `${HOME}/Documents/Zict/${basename(downloadUrls.en)}`,
        `${HOME}/Documents/Zict/wiktionary_en_all_maxi_2022-09.zim`,
    ],
    ru: [
        `${HOME}/Documents/Zict/${basename(downloadUrls.ru)}`,
        `${HOME}/Documents/Zict/wiktionary_ru_all_maxi_2022-08.zim`,
    ],
    es: [
        `${HOME}/Documents/Zict/${basename(downloadUrls.es)}`,
        `${HOME}/Documents/Zict/wiktionary_es_all_maxi_2023-01.zim`,
    ],
    ja: [
        `${HOME}/Documents/Zict/${basename(downloadUrls.ja)}`,
        `${HOME}/Documents/Zict/wiktionary_ja_all_maxi_2022-12.zim`,
    ],
};

// The languages to include in "find" results.
export const find = [
    'en',
    'ru'
];
