#!/usr/bin/env node

import subcommands from '../library/commands.mjs';
import { Command } from 'commander';

const argument = {
    language: ['<language>', 'The language dictionary to use for the search'],
    languages: ['[languages...]', 'List language-specific dictionary URLs for download'],
    path: ['<path>', 'The path where to save the search result'],
    urls: ['<urls...>', 'The language dictionaries to download'],
    words: ['<words...>', 'The words to search'],
};

export const program = new Command();

program.name('zwim')
    .description('A command-line dictionary based on zim and w3m.')
    .version('1.0.0');

program.command('view')
    .description('View word definition in one dictionary.')
    .argument(...argument.language)
    .argument(...argument.words)
    .action(async (language, words) => {
        await subcommands.view(language, words);
    });

program.command('view-all')
    .description('View word definition in all dictionaries.')
    .argument(...argument.words)
    .action(async (words) => {
        await subcommands.viewAll(words);
    });

program.command('alter')
    .description('Alter word definition from one dictionary and view it.')
    .argument(...argument.language)
    .argument(...argument.words)
    .action(async (language, words) => {
        await subcommands.alter(language, words);
    });

program.command('alter-all')
    .description('Alter word definition from all dictionaries and view them.')
    .argument(...argument.words)
    .action(async (words) => {
        await subcommands.alterAll(words);
    });

program.command('dictionary-download')
    .description('Download dictionaries from their URLs.')
    .argument(...argument.urls)
    .action(async (urls) => {
        await subcommands.dictionaryDownload(urls);
    });

program.command('dictionary-search')
    .description('Search dictionaries and their download URLs.')
    .argument(...argument.languages)
    .action(async (languages) => {
        await subcommands.dictionarySearch(languages);
    });

program.command('output')
    .description('Save word definition from one dictionary in the path.')
    .argument(...argument.path)
    .argument(...argument.language)
    .argument(...argument.words)
    .action(async (path, language, words) => {
        await subcommands.output(path, language, words);
    });

program.command('output-alter')
    .description('Alter and save word definition from one dictionary in the path.')
    .argument(...argument.path)
    .argument(...argument.language)
    .argument(...argument.words)
    .action(async (path, language, words) => {
        await subcommands.outputAlter(path, language, words);
    });

program.command('search')
    .description('Search for similar words in a dictionary.')
    .argument(...argument.language)
    .argument(...argument.words)
    .option('-n, --number <number>', 'The max number of similar words to show.', parseInt)
    .action(async (language, words, options) => {
        await subcommands.search(language, words, options.number);
    });

program.command('copy-config')
    .description('Copy the default configuration file to the user\'s config directory.')
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
