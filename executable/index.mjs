#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import cliOptions from "../library/cli_options.mjs";
import command from "../library/command.mjs";
import { env } from "node:process";
import { load } from "js-yaml";
import scrape from "../library/download.mjs";
import { existsSync } from "node:fs";

class Settings {
    static get cache() {
        return env.XDG_CACHE_HOME ?? `${env.HOME}/.cache`;
    }
    // static get data() {
    //     return env.XDG_DATA_HOME ?? `${env.HOME}/.local/share`;
    // }
    static get cutomPath() {
        const config = env.XDG_CONFIG_HOME ?? `${env.HOME}/.config`;
        return env.ZWIM_CONFIGURATION ?? `${config}/zwim/zwim.yml`;
    }
    static get defaultPath() {
        return `${import.meta.dirname}/../configuration/zwim.yml`;
    }
    static get confFile() {
        return existsSync(Settings.cutomPath) ? Settings.cutomPath : Settings.defaultPath;
    }
}

/**
 * Return the dictionaries according to the given language.
 *
 * @param {string|"find"} language The language for which to get the dictionary.
 * @returns {Promise<string[]>} Return the dictionaries.
 */
async function getDictionary(language) {
    const configuration = load(await readFile(Settings.confFile));
    let files = configuration.files[language];
    if (!files?.length) {
        const entries = Object.keys(configuration.files).join(", ");
        throw Error(
            `The file or file entry does not exist: [${Settings.confFile}].files.${language}` +
                `\nRecognized entries: ${entries}`,
        );
    }
    function escape(string) {
        return string.replace(/~|\$HOME/g, process.env.HOME);
    }
    if (language == "find") {
        return files.map((file) => configuration.files[file].shift()).map(escape);
    }
    return escape(files.shift());
}

/**
 * Execute the command line options.
 */
async function main() {
    const options = cliOptions();
    const subcommand = options._.shift();

    const subcommands = {
        "copy-config": async function() {
            await command.copyFile(Settings.defaultPath, Settings.cutomPath);
        },
        "find-config": function() {
            console.log(Settings.confFile);
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
            const files = await getDictionary(options.language);
            await command.view(options.$0, files, options.words, alter, find);
            return;
        },
        d: function() {
            return this.download();
        },
        download: async function() {
            const htmlContents = `${Settings.cache}/zwim/dumps.wikimedia.org.html`;
            const jsonContents = `${Settings.cache}/zwim/dumps.wikimedia.org.json`;
            const wiktionaryUrl = "https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/";
            const stat = await command.stat(jsonContents);
            // Update if more than a week old.
            const oneWeek = Date.UTC(0, 0, 7);
            const isOneWeekOld = Date.now() > stat.mtime + oneWeek;
            if (!stat || isOneWeekOld) {
                if (isOneWeekOld) {
                    console.log("Dictionary index is more than one week old.");
                }
                console.log(`Fetching ${wiktionaryUrl}`);
                await command.fetchDocument(wiktionaryUrl, htmlContents);
                const entries = await scrape(htmlContents);
                console.log(`Saving ${jsonContents}`);
                await command.saveJson(entries, jsonContents);
            }

            const entries = JSON.parse(await readFile(jsonContents));

            // Handle nah (Nahuatl) and guw (Gungbe).
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
                compactDisplay: "long",
                style: "unit",
                unit: "byte",
                unitDisplay: "long",
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
            for (const language of options.urls) {
                const x = dictionaries[language];
                console.log(x);
            }
            // command.downloadFile();
            //     cmd_download "$my_download_dir" "$(my_download_urls "$2")"
        },
        s: function() {
            return this.search();
        },
        search: async function() {
            const files = await getDictionary(options.language);
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
    await subcommands[subcommand]();
}
main();
