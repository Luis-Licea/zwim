import subcommands from '../library/commands.mjs';
import { Command, Help } from 'commander';
import { readFile } from 'node:fs/promises';
import translate from '../manual-generator/translate.mjs';

/** @type {import("../package.json")} */
const packageJson = JSON.parse(await readFile(`${import.meta.dirname}/../package.json`));

export default function consoleOptions(locale = 'en') {
    const language = translate(locale);
    const program = new Command();

    program.configureHelp({
        formatHelp: (cmd, helper) => {
            const originalHelp = new Help();
            return originalHelp.formatHelp(cmd, helper)
                .replace(language.placeHolders.en.options, language.placeHolders.locale.options)
                .replace(language.placeHolders.en.command, language.placeHolders.locale.command)
                .replace(language.helpHeader.en.arguments, language.helpHeader.locale.arguments)
                .replace(language.helpHeader.en.commands, language.helpHeader.locale.commands)
                .replace(language.helpHeader.en.options, language.helpHeader.locale.options)
                .replace(language.helpHeader.en.usage, language.helpHeader.locale.usage);
        }
    });
    const command = (commandDefinition) =>
        program.command(commandDefinition.locale.name)
            .alias(commandDefinition.locale.alias)
            .description(commandDefinition.locale.description);

    program.name(language.zwim.locale)
        .description(language.description.locale)
        .version(packageJson.version, ...language.version.locale);

    program.helpOption(...language.helpFlag.locale);

    command(language.alter)
        .argument(...language.language.locale)
        .argument(...language.words.locale)
        .action(async (language, words) => {
            await subcommands.alter(language, words);
        });

    command(language.alterAll)
        .argument(...language.words.locale)
        .action(async (words) => {
            await subcommands.alterAll(words);
        });

    command(language.copyConfig)
        .action(async () => {
            await subcommands.copyConfig();
        });

    command(language.dictionaryDownload)
        .argument(...language.urls.locale)
        .action(async (urls) => {
            await subcommands.dictionaryDownload(urls);
        });

    command(language.dictionarySearch)
        .argument(...language.languages.locale)
        .action(async (languages) => {
            await subcommands.dictionarySearch(languages);
        });

    command(language.findConfig)
        .action(() => {
            subcommands.findConfig();
        });

    command(language.output)
        .argument(...language.path.locale)
        .argument(...language.language.locale)
        .argument(...language.words.locale)
        .action(async (path, language, words) => {
            await subcommands.output(path, language, words);
        });

    command(language.outputAlter)
        .argument(...language.path.locale)
        .argument(...language.language.locale)
        .argument(...language.words.locale)
        .action(async (path, language, words) => {
            await subcommands.outputAlter(path, language, words);
        });

    command(language.search)
        .argument(...language.language.locale)
        .argument(...language.words.locale)
        .option(...language.number.locale, parseInt)
        .action(async (language, words, options) => {
            await subcommands.search(language, words, options.number);
        });

    command(language.view)
        .argument(...language.language.locale)
        .argument(...language.words.locale)
        .action(async (language, words) => {
            await subcommands.view(language, words);
        });

    command(language.viewAll)
        .argument(...language.words.locale)
        .action(async (words) => {
            await subcommands.viewAll(words);
        });

    program.helpCommand(...language.help.locale);

    return program;
}
