export const translations = {
    zwim: {
        locale: '',
        en: 'zwim',
        es: 'nada'
    },
    // Usage
    description: {
        locale: '',
        en: 'A command-line dictionary based on zim and w3m.',
        es: 'Un diccionario de línea de comandos basado en zim y w3m.',
    },
    // Options
    version: {
        locale: [],
        en: ['-v, --version', 'Output the version number.'],
        es: ['-v, --version', 'Muestra el numero de version.'],
    },
    helpFlag: {
        locale: [],
        en: ['-h, --help', 'Display this help message.'],
        es: ['-a, --ayuda', 'Muestra este mensaje de ayuda.'],
    },
    helpHeader: {
        locale: { arguments: '', commands: '', options: '', usage: '' },
        en: { arguments: 'Arguments:', commands: 'Commands:', options: 'Options:', usage: 'Usage:' },
        es: { arguments: 'Argumentos:', commands: 'Comandos:', options: 'Opciones:', usage: 'Uso:' },
        ru: { arguments: 'Аргументы:', commands: 'Команды:', options: 'Опции:', usage: 'Использование:' },
    },
    placeHolders: {
        locale: { options: '', command: '' },
        en: { options: '[options]', command: '[command]' },
        es: { options: '[opciones]', command: '[commando]' },
        ru: { options: '[опции]', command: '[команды]' },
    },
    // Arguments.
    language: {
        locale: [],
        en: ['<language>', 'The language dictionary to use for the search.'],
        es: ['<lenguage>', 'El lenguage del diccionario que se utilizará para la búsqueda.'],
    },
    languages: {
        locale: [],
        en: ['[languages...]', 'List dictionary URLs for download.'],
        es: ['[lenguages...]', 'Muestra una lista de URL de diccionarios para descargar.'],
    },
    path: {
        locale: [],
        en: ['<path>', 'The path where to save the search result.'],
        es: ['<ruta>', 'La ruta donde guardar el resultado de la búsqueda.'],
    },
    urls: {
        locale: [],
        en: ['<urls...>', 'The dictionaries to download.'],
        es: ['<urls...>', 'Los diccionarios que descargar.'],
    },
    words: {
        locale: [],
        en: ['<words...>', 'The words to search.'],
        es: ['<palabras...>', 'Las palabras que hay que buscar.'],
    },
    number: {
        locale: [],
        en: ['-n, --number <number>', 'The max number of similar words to show.'],
        es: ['-n, --numbero <numbero>', 'El número máximo de palabras similares a mostrar.'],
    },
    // Commands
    alter: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'alter', alias: 'a', description: 'Alter a word definition from one dictionary and view it.' },
        es: { name: 'altera', alias: 'a', description: 'Cambia la definición de una palabra de un diccionario y visualízala.' },
    },
    alterAll: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'alter-all', alias: 'aa', description: 'Alter the word definitions from all dictionaries and view them.' },
        es: { name: 'altera-todo', alias: 'at', description: 'Altera la definición de palabras de todos los diccionarios y visualízalas.' },
    },
    copyConfig: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'copy-config', alias: 'c', description: 'Copy the default configuration file to the user\'s config directory.' },
        es: { name: 'copia-configuracion', alias: 'c', description: 'Copie el archivo de configuración por defecto en el directorio config del usuario.' },
    },
    dictionaryDownload: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'dictionary-download', alias: 'dd', description: 'Download dictionaries from their URLs.' },
        es: { name: 'descara-diccionario', alias: 'dd', description: 'Descargar diccionarios desde sus URL.' },
    },
    dictionarySearch: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'dictionary-search', alias: 'ds', description: 'Search dictionaries and their download URLs.' },
        es: { name: 'busca-diccionario', alias: 'bs', description: 'Busca diccionarios y sus URL de descarga.' },
    },
    findConfig: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'find-config', alias: 'f', description: 'Return the path to the default configuration file.' },
        es: { name: 'encuentra-configuracion', alias: 'e', description: 'Devuelve la ruta al archivo de configuración por defecto.' },
    },
    help: {
        locale: [],
        en: ['help', 'Display help for the command.'],
        es: ['ayuda', 'Muestra ayuda para el commando.'],
    },
    output: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'output', alias: 'o', description: 'Save the word definition from one dictionary into the path.' },
        es: { name: 'guarda', alias: 'g', description: 'Guarda la definición de una palabra de un diccionario en la ruta.' },
    },
    outputAlter: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'output-alter', alias: 'oa', description: 'Alter and save the word definition from one dictionary into the path.' },
        es: { name: 'guarda-altera', alias: 'ga', description: 'Modifica y guarda la definición de una palabra de un diccionario en la ruta.' },
    },
    search: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'search', alias: 's', description: 'Search for similar words in a dictionary.' },
        es: { name: 'busca', alias: 'b', description: 'Busca palabras similares en un diccionario.' },
    },
    view: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'view', alias: 'v', description: 'View the word definition in one dictionary.' },
        es: { name: 've', alias: 'v', description: 'Ve la definición de la palabra en un diccionario.' },
    },
    viewAll: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'view-all', alias: 'va', description: 'View the word definitions in all dictionaries.' },
        es: { name: 've-todo', alias: 'vt', description: 'Ve definición de la palabra en todos los diccionarios.' },
    },
};

/**
* @returns {translations} The translations.
*/
export default function translate(locale = navigator.language.slice(0, 2)) {
    const languageTranslations = structuredClone(translations);
    for (const [variable, translation] of Object.entries(translations)) {
        languageTranslations[variable].locale = translation[locale] ?? translation.en;
    }
    // Turn 'help' into 'help [command]'.
    languageTranslations.help.locale[0] += ` ${languageTranslations.placeHolders.locale.command}`;
    return languageTranslations;
}
