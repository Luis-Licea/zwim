#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import cliOptions from "../library/cli_options.mjs";
import command from "../library/command.mjs";
import { env } from "node:process";
import { load } from "js-yaml";

/**
 * Execute the command line options.
 */
async function main() {
    const folder = env.XDG_CONFIG_HOME ?? `${env.HOME}/.config/`;
    const zwimJson = "zwim/zwim.yml";
    const confCustomPath = `${folder}/${zwimJson}`;
    // const confDefaultPath = `/etc/${zwimJson}`;
    const confDefaultPath = `configuration/zwim.yml`;
    const confFile = (await command.stat(confCustomPath))
        ? confCustomPath
        : confDefaultPath;

    const options = await cliOptions();
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
        const file = configuration.files[options.language]
            .shift()
            .replace("~", process.env.HOME);

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
        case "download":
            if (!options.languages && !options.urls) {
                console.log("English, Russian");
            }
            // command.downloadFile();
            //     cmd_download "$my_download_dir" "$(my_download_urls "$2")"
            return;
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
