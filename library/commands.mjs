import File from "../library/file.mjs";
import command from "../library/command.mjs";
import scrape from "../library/download.mjs";
import { readFile, stat } from "node:fs/promises";
import { filterLanguages } from "./filterLanguages.mjs";

export default {
    /**
     * Copy the file from the source to the destination path. Existing files will
     * not be overwritten.
     */
    copyConfig: async function() {
        const destinationPath = File.customSettings;
        const sourcePath = File.defaultSettings;
        await command.copyFile(File.defaultSettings, File.customSettings);
        if (existsSync(destinationPath)) {
            throw Error(`Destination file alrady exists: ${destinationPath}`);
        }
        await cp(sourcePath, destinationPath, { recursive: true, errorOnExist: true });
        await chmod(destinationPath, 0o622);
    },
    findConfig: function() {
        console.log(File.settings);
    },
    find: function(words) {
        return this.view("find", words, false, true);
    },
    alter: function(language, words) {
        return this.view(language, words, true, false);
    },
    view: async function(language, words, alter = false, find = false, prefix = "zwim") {
        const files = await File.getDictionary(language);
        await command.view(prefix, files, words, alter, find);
    },
    download: async function(urls, list = []) {
        const wiktionaryUrl = "https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/";
        const status = await stat(File.languageListJson).catch(() => null);
        // Update if more than a week old.
        const oneWeek = Date.UTC(0, 0, 7);
        const isOneWeekOld = Date.now() > status?.mtime + oneWeek;
        if (!status || isOneWeekOld) {
            if (isOneWeekOld) {
                console.log("Dictionary index is more than one week old.");
            }
            console.log(`Fetching ${wiktionaryUrl}`);
            await command.fetchDocument(wiktionaryUrl, File.languageListHtml);
            const entries = await scrape(File.languageListHtml);
            console.log(`Saving ${File.languageListJson}`);
            await command.saveJson(entries, File.languageListJson);
        }

        const entries = JSON.parse(await readFile(File.languageListJson));

        // Handle Nahuatl (nah) and Gungbe (guw).
        const nahuatl = "nah";
        const gungbe = "guw";
        if (nahuatl in entries) {
            entries["Nahuatl"] = entries[nahuatl];
            delete entries[nahuatl];
        }
        if (gungbe in entries) {
            entries["Gungbe"] = entries[gungbe];
            delete entries[gungbe];
        }

        // Transform en_US.UTF-8 into simply "en-US".
        const localeIso = process.env?.LANG?.split(".")?.shift()?.replace("_", "-") ?? "en";
        const languageNames = new Intl.DisplayNames([localeIso], { type: "language" });
        const collator = new Intl.Collator(localeIso).compare;
        const byteValueNumberFormatter = Intl.NumberFormat(localeIso, {
            notation: "compact",
            compactDisplay: "short",
            style: "unit",
            unit: "byte",
            unitDisplay: "narrow",
        });

        const languages = Object.keys(entries);
        const dictionaries = {};
        for (const language of languages) {
            const languageName = languageNames.of(language);
            for (const entry of entries[language]) {
                entry.size = byteValueNumberFormatter.format(entry.bytes).replace("BB", "GB");
                entry.date = new Date(entry.date);

                delete entry.bytes;
                delete entry.language;
                delete entry.languageIso;
                delete entry.rawDate;
                delete entry.basename;
            }
            dictionaries[languageName.toLowerCase()] = entries[language];
        }

        if (list === true) {
            const keys = Object.keys(dictionaries).sort(collator);
            console.dir(keys, { maxArrayLength: Number.MAX_VALUE });
            return;
        }

        if (list.length) {
            for (const language of urls) {
                if (!(language in dictionaries)) {
                    console.error(`Unknown language: ${language}`);
                    console.error("See --help for available languages");
                    process.exit(1)
                }
            }
            const availableDictionaries = Object.fromEntries(list.map(language => [language, dictionaries[language]]));
            console.dir(availableDictionaries);
        }

        // command.downloadFile();
        //     cmd_download "$my_download_dir" "$(my_download_urls "$2")"
    },
    search: async function(language, words, number = undefined) {
        const files = await File.getDictionary(language);
        const out = await command.search(files, words);
        console.dir(out.slice(0, number));
    },
    output: async function(path, language, words) {
        const zimFile = await File.getDictionary(language);
        return command.documentLoad(path, zimFile, words);
    },
    outputAlter: async function(path, language, words) {
        await this.output(path, language, words)
        await filterLanguages(path);
    },
};
