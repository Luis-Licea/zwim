#!/usr/bin/env node

import subcommands from "../library/commands.mjs";
import { Command } from 'commander';

const argument = {
    language: ["<language>", "The language dictionary to use for the search"],
    words: ["<words...>", "The words to search"],
    path: ["<path>", "The path where to save the search result"],
    urls: ["[urls...]", "The language dictionaries to download"]
};

export const program = new Command();

program.name('zwim')
    .description('A command-line dictionary based on zim and w3m.')
    .version('1.0.0');

program.command('view')
    .description('View the language word definition.')
    .argument(...argument.language)
    .argument(...argument.words)
    .action(async (language, words) => {
        await subcommands.view(language, words);
    });

program.command('find')
    .description('Find the definition accross languages.')
    .argument(...argument.words)
    .action(async (words) => {
        await subcommands.find(words);
    });

program.command('alter')
    .description('Alter and view the search result.')
    .argument(...argument.language)
    .argument(...argument.words)
    .action(async (language, words) => {
        await subcommands.alter(language, words);
    });

program.command('download')
    .description('The language dictionary URLs to download.')
    .argument(...argument.urls)
    .option('-l, --list [languages...]', 'List all the languages available for download')
    .addHelpText('afterAll', '\nUsage:')
    .addHelpText('afterAll', '  zwim download --list            Show all languages')
    .addHelpText('afterAll', '  zwim download --list english    Show english languages')
    .action(async (urls, options) => {
        await subcommands.download(urls, options.list);
    });

program.command('output')
    .description('Save the search result to the given path.')
    .argument(...argument.path)
    .argument(...argument.language)
    .argument(...argument.words)
    .action(async (path, language, words) => {
        await subcommands.output(path, language, words);
    });

program.command('output-alter')
    .description('Save the altered search result to the given path.')
    .argument(...argument.path)
    .argument(...argument.language)
    .argument(...argument.words)
    .action(async (path, language, words) => {
        await subcommands.outputAlter(path, language, words);
    });

program.command('search')
    .description('Search similar words in the given language.')
    .argument(...argument.language)
    .argument(...argument.words)
    .option('-n, --number <number>', 'The max number of similar words to show.', parseInt)
    .action(async (language, words, options) => {
        await subcommands.search(language, words, options.number);
    });

program.command('copy-config')
    .description("Copy the default configuration file to the user's config directory.")
    .action(async () => {
        await subcommands.copyConfig();
    });

program.command('find-config')
    .description('Return the path to the default configuration file.')
    .action(() => {
        subcommands.findConfig();
    });


if (import.meta.filename === process.argv[1]) {
    await program.parseAsync();
}
