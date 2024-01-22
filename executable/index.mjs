#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import cliOptions from "../library/cli_options.mjs";
import command from "../library/command.mjs";
import { env } from "node:process";
import {load} from "js-yaml";
import { resolve } from "node:path";
import { tmpdir } from "node:os";

// #######################################
// # View the definition for a phrase in the
// # Globals:
// #   XDG_CONFIG_HOME: The path to the local configuration folder.
// # Arguments:
// #   1: The command to execute. See --help.
// #   *: The command arguments. See --help.
// #######################################
async function main() {
    const folder = env.XDG_CONFIG_HOME ?? `${env.HOME}/.config/`;
    const zwimJson = "zwim/zwim.yml";
    const confCustomPath = `${folder}/${zwimJson}`;
    // const confDefaultPath = `/etc/${zwimJson}`;
    const confDefaultPath = `configuration/zwim.yml`;
    const confFile =  await command.stat(confCustomPath) ? confCustomPath : confDefaultPath;


    const options = await cliOptions();
    const subcommand = options._.shift();

    switch (subcommand) {
        case "copy-config":
            await command.copyFile(confDefaultPath, confCustomPath);
            return;
        case "find-config":
            console.log(confFile);
            return
    }

    const configuration = load(await readFile(confFile));

    // # Verify variables are defined.
    // for variable in MY_DOWNLOAD_DIR MY_PREPROCESSOR; do
    //     if [[ ! -v $variable ]]; then
    //         err "Error: Variable $variable not defined in '$conf_file'"
    //         exit 1
    //     fi
    // done
    //
    // if [[ -z ${#MY_DOWNLOAD_URLS[@]} ]]; then
    //     err "Error: Variable MY_DOWNLOAD_URLS not defined in '$conf_file'"
    //     exit 1
    // fi
    //
    // if [[ -z ${#MY_ZIM_FILES[@]} ]]; then
    //     err "Error: Variable MY_ZIM_FILES not defined in '$conf_file'"
    //     exit 1
    // fi
    //
    // # Rename sourced variables to provide better LSP support.
    // local -rn my_download_dir=MY_DOWNLOAD_DIR
    // # shellcheck disable=2034
    // local -rn my_preprocessor=MY_PREPROCESSOR
    // # shellcheck disable=2034
    // local -rn my_download_urls_dictionary=MY_DOWNLOAD_URLS
    // # shellcheck disable=2034
    // local -rn my_zim_files_dictionary=MY_ZIM_FILES
    // # shellcheck disable=2034
    // local -rn my_zim_hints_dictionary=MY_ZIM_HINTS
    //
    // #######################################
    // # Access dictionary values. Missing keys will not generate errors.
    // # Arguments:
    // #   1: The dictionary name-ref.
    // #   2: The dictionary key whose value will be returned.
    // #######################################
    // array_value() {
    //     local -nr array="$1"
    //     local -r key="$2"
    //     if [[ ! -v array["$key"] ]]; then
    //         local dictionary
    //         dictionary=$my_download_dir/$(basename "${my_download_urls_dictionary[$key]}")
    //         if [[ -f $dictionary ]]; then
    //             echo "$dictionary"
    //         else
    //             echo "The file '$dictionary' does not exist."
    //             exit 0
    //         fi
    //     fi
    //     echo "${array["$key"]}"
    // }
    //
    // my_zim_files() { array_value my_zim_files_dictionary "$1"; }
    // my_zim_hints() { array_value my_zim_hints_dictionary "$1"; }
    // my_download_urls() { array_value my_download_urls_dictionary "$1"; }
    //

    // console.log(configuration)
    // console.log(options)
    // console.log(tmpdir())
    switch (subcommand) {
        case "a":
        case "alter":
    //     cmd_view_document "$my_preprocessor" "$(my_zim_files "$2")" "${@:3}"
                return;
        case "v":
        case "view":
                const file = configuration.files[options.language].shift().replace("~", process.env.HOME);
                if (!(await command.stat(file))) {
                    console.error(`Error: The file does not exist. Correct the path [${confFile}].files.${options.language}: "${file}"`)
                    process.exit(1)
                }
                await command.view(options.$0, file, options.words)
                return;
        case "d":
        case "download":
            // command.downloadFile()
    //     cmd_download "$my_download_dir" "$(my_download_urls "$2")"
                return;
        case "s":
        case "search":
    //     cmd_search "$(my_zim_files "$2")" "${@:3}"
                return;
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
main()
