#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import cliOptions from "../library/cli_options.mjs";
import command from "../library/command.mjs";
import scrape from "../library/download.mjs";
import File from "../library/file.mjs";

/**
 * Execute the command line options.
 */
async function main() {
    const options = cliOptions();
    const subcommand = options._.shift();
    const subcommands = {
        "copy-config": async function() {
            await command.copyFile(File.defaultSettings, File.customSettings);
        },
        "find-config": function() {
            console.log(File.settings);
        },
        f: function() {
            return this.find();
        },
        find: function() {
            options.language = "find";
            return this.view(false, true);
        },
        a: function() {
            return this.alter();
        },
        alter: function() {
            return this.view(true, false);
        },
        v: function() {
            return this.view();
        },
        view: async function(alter = false, find = false) {
            const files = await File.getDictionary(options.language);
            await command.view(options.$0, files, options.words, alter, find);
        },
        d: function() {
            return this.download();
        },
        download: async function() {
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
                    entry.size = byteValueNumberFormatter.format(entry.bytes);
                    entry.date = new Date(entry.date);

                    delete entry.bytes;
                    delete entry.language;
                    delete entry.languageIso;
                    delete entry.rawDate;
                    delete entry.basename;
                }
                dictionaries[languageName.toLowerCase()] = entries[language];
            }

            console.log(options);
            if (!options.languages && !options.urls) {
                console.log("English, Russian");
            }

            if (!options?.urls?.length) {
                const keys = Object.keys(dictionaries).sort(collator);
                for (const key of keys) {
                    console.log(key);
                }
                return;
            }

            const availableDictionaries = Object.fromEntries(options.urls.map(language => [language, dictionaries[language]]));
            console.log(availableDictionaries);

            // command.downloadFile();
            //     cmd_download "$my_download_dir" "$(my_download_urls "$2")"
        },
        s: function() {
            return this.search();
        },
        search: async function() {
            const files = await File.getDictionary(options.language);
            let out = await command.search(files, options.words);
            if (options.n) {
                out = out.slice(0, options.n);
            }
            console.log(out.join("\n"));
        },
        o: function() {
            return this.output();
        },
        output: function() {
            //     cmd_output_document "$2" "" "$(my_zim_files "$3")" "${@:4}"
            return;
        },
        oa: function() {
            return this.output();
        },
        "output-alter": function() {
            //     cmd_output_document "$2" "$my_preprocessor" "$(my_zim_files "$3")" "${@:4}"
            return;
        },
    };
    if (subcommand in subcommands) {
        await subcommands[subcommand]();
    } else {
        console.error(`The command is not recognized: ${JSON.stringify(subcommand)}`);
        console.error("Use the --help flag or read the man page.");
    }
}
main();
