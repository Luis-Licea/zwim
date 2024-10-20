export const translations = {
    zwim: {
        locale: '',
        en: 'zwim',
        es: 'es',
        ru: 'ру',
    },
    // Usage
    description: {
        locale: '',
        en: 'A command-line dictionary based on zim and w3m.',
        es: 'Un diccionario de línea de comandos basado en zim y w3m.',
        ru: 'Словарь командной строки, основанный на zim и w3m.',
    },
    // Options
    version: {
        locale: [],
        en: ['-v, --version', 'Show the version number.'],
        es: ['-v, --version', 'Muestra el numero de version.'],
        ru: ['-в, --версия', 'Покажи номер версии.'],
    },
    helpFlag: {
        locale: [],
        en: ['-h, --help', 'Show this help message.'],
        es: ['-a, --ayuda', 'Muestra este mensaje de ayuda.'],
        ru: ['-п, --помаги', 'Покажи это справочное сообщение.'],
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
    argumentError: {
        locale: '',
        en: 'error: missing required argument',
        es: 'error: falta un argumento obligatorio',
        ru: 'ошибка: отсутствует необходимый аргумент'
    },
    optionError: {
        locale: '',
        en: 'error: unknown option',
        es: 'error: opción desconocida',
        ru: 'ошибка: неизвестная опция'
    },
    // Arguments.
    language: {
        locale: [],
        en: ['<language>', 'The dictionary language to use for the search.'],
        es: ['<lenguage>', 'El lenguage del diccionario que se utilizará para la búsqueda.'],
        ru: ['<язык>', 'Язык словаря, который будет использоваться для поиска.'],
    },
    languages: {
        locale: [],
        en: ['[languages...]', 'Show a list of dictionary URLs for download.'],
        es: ['[lenguages...]', 'Muestra una lista de URLs de diccionarios para descargar.'],
        ru: ['[языки...]', 'Показать список URL-адресов словарей для загрузки. '],
    },
    path: {
        locale: [],
        en: ['<path>', 'The path where to save the search result.'],
        es: ['<ruta>', 'La ruta donde guardar el resultado de la búsqueda.'],
        ru: ['<путь>', 'Путь, куда сохранять результат поиска'],
    },
    urls: {
        locale: [],
        en: ['<urls...>', 'The dictionaries to download.'],
        es: ['<urls...>', 'Los diccionarios que descargar.'],
        ru: ['<url-адреса...>', 'Словари для скачивания.'],
    },
    words: {
        locale: [],
        en: ['<words...>', 'The words to search.'],
        es: ['<palabras...>', 'Las palabras que hay que buscar.'],
        ru: ['<слова...>', 'Слова, которые нужно искать.'],
    },
    number: {
        locale: [],
        en: ['-n, --number <number>', 'The max number of similar words to show.'],
        es: ['-n, --numbero <numbero>', 'El número máximo de palabras similares a mostrar.'],
        ru: ['-н, --номер <номер>', 'Максимальное количество похожих слов для показа.'],
    },
    // Commands
    alter: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'alter', alias: 'a', description: 'Alter a word definition from one dictionary and view it.' },
        es: { name: 'altera', alias: 'a', description: 'Cambia la definición de una palabra de un diccionario y visualízala.' },
        ru: { name: 'измени', alias: 'и', description: 'Измените определение слова из одного словаря и просмотрите его.' },
    },
    alterAll: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'alter-all', alias: 'aa', description: 'Alter the word definitions from all dictionaries and view them.' },
        es: { name: 'altera-todos', alias: 'at', description: 'Altera la definición de palabras de todos los diccionarios y visualízalas.' },
        ru: { name: 'измени-все', alias: 'ив', description: 'Измени определение слов во всех словарях и отобрази их.' },
    },
    copyConfig: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'copy-config', alias: 'c', description: 'Copy the default configuration file to the user\'s config directory.' },
        es: { name: 'copia-configuracion', alias: 'c', description: 'Copie el archivo de configuración por defecto en el directorio config del usuario.' },
        ru: { name: 'скопируй-конфигурацию', alias: 'с', description: 'Скопируй файл конфигурации по умолчанию в каталог config пользователя.' },
    },
    dictionaryDownload: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'download-dictionary', alias: 'dd', description: 'Download dictionaries from their URLs.' },
        es: { name: 'descara-diccionario', alias: 'dd', description: 'Descargar diccionarios desde sus URL.' },
        ru: { name: 'cкачай-словарь', alias: 'сс', description: 'Загружай словари по их URL-адресам.' },
    },
    dictionarySearch: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'search-dictionary', alias: 'sd', description: 'Search dictionaries and their download URLs.' },
        es: { name: 'busca-diccionario', alias: 'bd', description: 'Busca diccionarios y sus URL de descarga.' },
        ru: { name: 'поищи-словарь', alias: 'пс', description: 'Поищи словари и URL-адреса для их загрузки.' },
    },
    findConfig: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'find-config', alias: 'f', description: 'Return the path to the default configuration file.' },
        es: { name: 'encuentra-configuracion', alias: 'e', description: 'Devuelve la ruta al archivo de configuración por defecto.' },
        ru: { name: 'найти-конфигурацию', alias: 'н', description: 'Возвращает путь к файлу конфигурации по умолчанию.' },
    },
    help: {
        locale: [],
        en: ['help', 'Show help for the command.'],
        es: ['ayuda', 'Muestra ayuda para el commando.'],
        ru: ['помоги', 'Покожи помощь по команды.'],
    },
    save: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'save', alias: 's', description: 'Save the word definition from one dictionary into the path.' },
        es: { name: 'guarda', alias: 'g', description: 'Guarda la definición de una palabra de un diccionario en la ruta.' },
        ru: { name: 'сохрони', alias: 'со', description: 'Сохрани определение слова из одного словаря в путь.' },
    },
    alterSave: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'alter-save', alias: 'as', description: 'Alter and save the word definition from one dictionary into the path.' },
        es: { name: 'altera-guarda', alias: 'ag', description: 'Modifica y guarda la definición de una palabra de un diccionario en la ruta.' },
        ru: { name: 'измени-сохрони', alias: 'ис', description: 'Измени и сохрани определение слова из одного словаря в путь.' },
    },
    search: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'search', alias: 'se', description: 'Search for similar words in a dictionary.' },
        es: { name: 'busca', alias: 'b', description: 'Busca palabras similares en un diccionario.' },
        ru: { name: 'поищи', alias: 'по', description: 'Найдите похожие слова в словаре.' },
    },
    view: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'view', alias: 'v', description: 'View the word definition in one dictionary.' },
        es: { name: 've', alias: 'v', description: 'Ve la definición de la palabra en un diccionario.' },
        ru: { name: 'посмотри', alias: 'п', description: 'Посмотрите определение слова в одном словаре.' },
    },
    viewAll: {
        locale: { name: '', alias: '', description: '' },
        en: { name: 'view-all', alias: 'va', description: 'View the word definitions in all dictionaries.' },
        es: { name: 've-todo', alias: 'vt', description: 'Ve definición de la palabra en todos los diccionarios.' },
        ru: { name: 'посмотри-все', alias: 'пв', description: 'Посмотреть значения слова во всех словарях.' },
    },
};

/**
* @returns {translations} The translations.
*/
export default function translate(locale = Intl.Collator().resolvedOptions().locale.slice(0, 2)) {
    const languageTranslations = structuredClone(translations);
    for (const [variable, translation] of Object.entries(translations)) {
        languageTranslations[variable].locale = translation[locale] ?? translation.en;
    }
    // Turn 'help' into 'help [command]'.
    languageTranslations.help.locale[0] += ` ${languageTranslations.placeHolders.locale.command}`;
    return languageTranslations;
}
