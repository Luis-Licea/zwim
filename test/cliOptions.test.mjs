import assert from 'node:assert/strict';
import consoleOptions from '../library/consoleOptions.mjs';
import subcommands from '../library/commands.mjs';

const program = consoleOptions();

function kebabCaseToCamelCase(string) {
    return string.replace(/-./g, m => m[1].toUpperCase());
}

describe('The command parser', function() {
    this.beforeAll(() => {
        this.functions = Object.values(subcommands);
    });

    this.afterAll(() => {
        for (const [functionName, functionPointer] of Object.entries(subcommands)) {
            if (this.functions.includes(functionPointer)) {
                assert.fail(`The function was not tested: ${functionName}`);
            }
        }
    });

    it('parses copy-config command', async () => {
        const expected = {
            command: 'copy-config',
        };
        const cliArguments = [
            expected.command,
        ];
        let called = false;
        subcommands[kebabCaseToCamelCase(expected.command)] = () => {
            called = true;
        };
        program.parseAsync(cliArguments, { from: 'user' });
        assert.ok(called, 'Function not called');
    });

    it('parses find-config command', async () => {
        const expected = {
            command: 'find-config',
        };
        const cliArguments = [
            expected.command,
        ];
        let called = false;
        subcommands[kebabCaseToCamelCase(expected.command)] = () => {
            called = true;
        };
        program.parseAsync(cliArguments, { from: 'user' });
        assert.ok(called, 'Function not called');
    });

    it('parses view-all command arguments', async () => {
        const expected = {
            command: 'view-all',
            words: ['the', 'quick', 'brown', 'fox'],
        };
        const cliArguments = [
            expected.command,
            ...expected.words,
        ];
        let called = false;
        subcommands[kebabCaseToCamelCase(expected.command)] = (words) => {
            assert.deepEqual(words, expected.words);
            called = true;
        };
        program.parseAsync(cliArguments, { from: 'user' });
        assert.ok(called, 'Function not called');
    });

    it('parses view command arguments', async () => {
        const expected = {
            command: 'view',
            language: 'english',
            words: ['the', 'quick', 'brown', 'fox'],
        };
        const cliArguments = [
            expected.command,
            expected.language,
            ...expected.words,
        ];
        let called = false;
        subcommands[expected.command] = (language, words) => {
            assert.deepEqual(language, expected.language);
            assert.deepEqual(words, expected.words);
            called = true;
        };
        program.parseAsync(cliArguments, { from: 'user' });
        assert.ok(called, 'Function not called');
    });

    it('parses search command arguments', async () => {
        const expected = {
            command: 'search',
            language: 'english',
            words: ['the', 'quick', 'brown', 'fox'],
        };
        const cliArguments = [
            expected.command,
            expected.language,
            ...expected.words,
        ];
        let called = false;
        subcommands[expected.command] = (language, words) => {
            assert.deepEqual(language, expected.language);
            assert.deepEqual(words, expected.words);
            called = true;
        };
        program.parseAsync(cliArguments, { from: 'user' });
        assert.ok(called, 'Function not called');
    });

    for (const command of ['output', 'output-alter']) {
        it(`parses ${command} command arguments`, async () => {
            const expected = {
                command,
                path: 'file.html',
                language: 'english',
                words: ['the', 'quick', 'brown', 'fox'],
            };
            const cliArguments = [
                expected.command,
                expected.path,
                expected.language,
                ...expected.words,
            ];
            let called = false;
            subcommands[kebabCaseToCamelCase(expected.command)] = (path, language, words) => {
                assert.deepEqual(path, expected.path);
                assert.deepEqual(language, expected.language);
                assert.deepEqual(words, expected.words);
                called = true;
            };
            program.parseAsync(cliArguments, { from: 'user' });
            assert.ok(called, 'Function not called');
        });
    }

    it('parses alter command arguments', async () => {
        const expected = {
            command: 'alter',
            language: 'english',
            words: ['the', 'quick', 'brown', 'fox'],
        };
        const cliArguments = [
            expected.command,
            expected.language,
            ...expected.words,
        ];
        let called = false;
        subcommands[expected.command] = (language, words) => {
            assert.deepEqual(language, expected.language);
            assert.deepEqual(words, expected.words);
            called = true;
        };
        program.parseAsync(cliArguments, { from: 'user' });
        assert.ok(called, 'Function not called');
    });

    it('parses alter-all command arguments', async () => {
        const expected = {
            command: 'alter-all',
            words: ['the', 'quick', 'brown', 'fox'],
        };
        const cliArguments = [
            expected.command,
            ...expected.words,
        ];
        let called = false;
        subcommands[kebabCaseToCamelCase(expected.command)] = (words) => {
            assert.deepEqual(words, expected.words);
            called = true;
        };
        program.parseAsync(cliArguments, { from: 'user' });
        assert.ok(called, 'Function not called');
    });

    it('parses dictionary-download command arguments', () => {
        const expected = {
            command: 'dictionary-download',
            urls: ['https://some-url', 'https://another-url'],
        };
        const cliArguments = [expected.command, ...expected.urls];

        let called = false;
        subcommands[kebabCaseToCamelCase(expected.command)] = (urls) => {
            assert.deepEqual(urls, expected.urls);
            called = true;
        };
        program.parseAsync(cliArguments, { from: 'user' });
        assert.ok(called, 'Function not called');
    });

    it('parses dictionary-search command arguments', () => {
        const expectedList = [
            {
                command: 'dictionary-search',
                languages: [],
            },
            {
                command: 'dictionary-search',
                languages: ['en', 'es'],
            },
        ];
        for (const expected of expectedList) {
            const cliArguments = [expected.command, ...expected.languages];

            let called = false;
            subcommands[kebabCaseToCamelCase(expected.command)] = (languages) => {
                assert.deepEqual(languages, expected.languages);
                called = true;
            };
            program.parseAsync(cliArguments, { from: 'user' });
            assert.ok(called, `Function not called: ${JSON.stringify(expected)}`);
        }
    });
});
