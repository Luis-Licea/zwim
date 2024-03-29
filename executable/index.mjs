#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import cliOptions from "../library/cli_options.mjs";
import command from "../library/command.mjs";
import { env } from "node:process";
import { load } from "js-yaml";
import scrape from "../library/download.mjs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

/**
 * Execute the command line options.
 */
async function main() {
    const config = env.XDG_CONFIG_HOME ?? `${env.HOME}/.config`;
    const cache = env.XDG_CACHE_HOME ?? `${env.HOME}/.cache`;
    const data = env.XDG_DATA_HOME ?? `${env.HOME}/.local/share`;
    const zwimJson = "zwim/zwim.yml";
    const directory = fileURLToPath(dirname(import.meta.url));
    const confCustomPath = env.ZWIM_CONFIGURATION ?? `${config}/${zwimJson}`;
    const confDefaultPath = `${directory}/../configuration/zwim.yml`;
    const confFile = (await command.stat(confCustomPath)) ? confCustomPath : confDefaultPath;

    const options = cliOptions();
    const subcommand = options._.shift();

    switch (subcommand) {
        case "copy-config":
            await command.copyFile(confDefaultPath, confCustomPath);
            return;
        case "find-config":
            console.log(confFile);
            return;
    }

    const configuration = load(await readFile(confFile));

    async function getFile() {
        const file = configuration.files[options.language].shift().replace("~", process.env.HOME);

        if (!(await command.stat(file))) {
            console.error(
                `Error: The file does not exist. Correct the path [${confFile}].files.${options.language}: "${file}"`,
            );
            process.exit(1);
        }
        return file;
    }
    // console.log(options);
    let alter = false;
    switch (subcommand) {
        case "a":
        case "alter":
            alter = true;
        case "v":
        case "view": {
            const file = await getFile();
            await command.view(options.$0, file, options.words, alter);
            return;
        }
        case "d":
        case "download": {
            const htmlContents = `${cache}/zwim/dumps.wikimedia.org.html`;
            const jsonContents = `${cache}/zwim/dumps.wikimedia.org.json`;
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
            return;
        }
        case "s":
        case "search": {
            const file = await getFile();
            let out = await command.search(file, options.words);
            if (options.n) {
                out = out.slice(0, options.n);
            }
            console.log(out.join("\n"));
            return;
        }
        case "o":
        case "output":
            //     cmd_output_document "$2" "" "$(my_zim_files "$3")" "${@:4}"
            return;
        case "oa":
        case "output-alter":
            //     cmd_output_document "$2" "$my_preprocessor" "$(my_zim_files "$3")" "${@:4}"
            return;
    }
}
main();
