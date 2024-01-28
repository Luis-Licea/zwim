import assert from "node:assert/strict";

import cliOptions from "../library/cli_options.mjs";

it("view command", async () => {
    const expected = {
        command: "view",
        language: "english",
        words: ["the", "quick", "brown", "fox"],
    };
    const actual = await cliOptions([
        expected.command,
        expected.language,
        ...expected.words,
    ]);
    assert.deepEqual(actual._[0], expected.command);
    assert.deepEqual(actual.language, expected.language);
    assert.deepEqual(actual.words, expected.words);
});

it("alter command", async () => {
    const expected = {
        command: "alter",
        language: "english",
        words: ["the", "quick", "brown", "fox"],
    };
    const actual = await cliOptions([
        expected.command,
        expected.language,
        ...expected.words,
    ]);
    assert.deepEqual(actual._[0], expected.command);
    assert.deepEqual(actual.language, expected.language);
    assert.deepEqual(actual.words, expected.words);
});

it("download command", async () => {
    const expected = {
        command: "download",
        lanaguages: ["english", "spanish", "русский"],
    };
    const actual = await cliOptions([expected.command, ...expected.lanaguages]);
    assert.deepEqual(actual._[0], expected.command);
    assert.deepEqual(actual.languages, expected.lanaguages);
});

for (const command of ["output", "output-alter"]) {
    it(`${command} command`, async () => {
        const expected = {
            command: command,
            path: "/tmp/hello_world.html",
            language: "english",
            words: ["hello", "world"],
        };
        const actual = await cliOptions([
            expected.command,
            expected.path,
            expected.language,
            ...expected.words,
        ]);
        assert.deepEqual(actual._[0], expected.command);
        assert.deepEqual(actual.path, expected.path);
        assert.deepEqual(actual.language, expected.language);
        assert.deepEqual(actual.words, expected.words);
    });
}

it("search command", async () => {
    const expected = {
        command: "search",
        language: "english",
        words: ["hello", "world"],
    };
    const actual = await cliOptions([
        expected.command,
        expected.language,
        ...expected.words,
    ]);
    assert.deepEqual(actual._[0], expected.command);
    assert.deepEqual(actual.language, expected.language);
    assert.deepEqual(actual.words, expected.words);
});

for (const command of ["copy-config", "find-config"]) {
    it(`${command} command`, async () => {
        const expected = {
            command: command,
            language: "english",
        };
        const actual = await cliOptions([expected.command]);
        assert.deepEqual(actual._[0], expected.command);
    });
}
