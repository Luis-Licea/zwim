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
 * @returns {Promise<{_: string[], $0: string, words: string[]?, language:
 * string?, languages: string[]?, path: string?}>}
 * */
export default async function cliOptions(argv = hideBin(process.argv)) {
    return yargs(argv)
        .scriptName("zwim")
        .usage("$0 <command> [arguments]")
        .command("view <language> <words...>", "View the language word definition.", (yargs) => {
            yargs.positional(...argument.language).positional(...argument.words)
        })
        .command(
            "alter <language> <words...>",
            "Alter and view the search result.",
            (yargs) => {
                yargs
                    .positional(...argument.language)
                    .positional(...argument.words);
            },
            function (argv) {
                console.log("hello", argv.language, "welcome to yargs!");
            },
        )
        .command(
            "download <languages...>",
            "The language dictionaries to download.",
            (yargs) => {
                yargs.positional("languages", {
                    type: "string",
                    describe: "The language dictionaries to download",
                });
            },
            function (argv) {
                console.log("hello", argv.language, "welcome to yargs!");
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
            function (argv) {
                console.log("hello", argv.language, "welcome to yargs!");
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
            function (argv) {
                console.log("hello", argv.language, "welcome to yargs!");
            },
        )
        .command(
            "search <language> <words...>",
            "Search similar words in the given language.",
            (yargs) => {
                yargs
                    .positional(...argument.language)
                    .positional(...argument.words);
            },
            function (argv) {
                console.log("hello", argv.language, "welcome to yargs!");
            },
        )
        .command(
            "copy-config",
            "Copy the default configuration file to TODO",
            function (argv) {
                console.log("hello", argv.language, "welcome to yargs!");
            },
        )
        .command(
            "find-config",
            "Return the path to the default configuration file.",
            function (argv) {
                console.log("hello", argv.language, "welcome to yargs!");
            },
        )
        .demandCommand()
        .help()
        .parse();
}
