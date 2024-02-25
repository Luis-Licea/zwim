import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argument = {
    language: [
        "language",
        {
            type: "string",
            describe: "The language dictionary to use for the search",
        },
    ],
    words: [
        "words",
        {
            type: "string",
            describe: "The words to search",
        },
    ],
    path: [
        "path",
        {
            type: "string",
            describe: "The path where to save the search result",
        },
    ],
};

/**
 * Return the command-line arguments.
 *
 * @param {string[]} [argv=process.argv] The arguments.
 * @returns {{_: string[], $0: string, words: string[]?, language: string?, languages: string[]?, urls: string[]?, path: string?}}
 * */
export default function cliOptions(argv = hideBin(process.argv)) {
    return yargs(argv)
        .scriptName("zwim")
        .usage("$0 <command> [arguments]")
        .command(
            "find <words...>",
            "Find the definition accross languages.",
            (yargs) => {
                yargs
                    .positional(...argument.words);
            },
        )
        .command(
            "view <language> <words...>",
            "View the language word definition.",
            (yargs) => {
                yargs
                    .positional(...argument.language)
                    .positional(...argument.words);
            },
        )
        .command(
            "alter <language> <words...>",
            "Alter and view the search result.",
            (yargs) => {
                yargs
                    .positional(...argument.language)
                    .positional(...argument.words);
            },
        )
        .command(
            "download [urls...]",
            "The language dictionary URLs to download.",
            (yargs) => {
                yargs.positional("languages", {
                    type: "string",
                    // default: [],
                    describe: "The language dictionaries to download",
                });
            },
        )
        .command(
            "output <path> <language> <words...>",
            "Save the search result to the given path.",
            (yargs) => {
                yargs
                    .positional(...argument.path)
                    .positional(...argument.language)
                    .positional(...argument.words);
            },
        )
        .command(
            "output-alter <path> <language> <words...>",
            "Save the altered search result to the given path.",
            (yargs) => {
                yargs
                    .positional(...argument.path)
                    .positional(...argument.language)
                    .positional(...argument.words);
            },
        )
        .command(
            "search <language> <words...>",
            "Search similar words in the given language.",
            (yargs) => {
                yargs
                    .positional(...argument.language)
                    .positional(...argument.words)
                    .option("n", {
                        type: "number",
                        describe: "The max number of similar words to show.",
                    });
            },
        )
        .command("copy-config", "Copy the default configuration file to TODO")
        .command(
            "find-config",
            "Return the path to the default configuration file.",
        )
        .demandCommand()
        .help()
        .parse();
}
