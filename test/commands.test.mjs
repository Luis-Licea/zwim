import assert from 'node:assert/strict';
import commands from '../library/commands.mjs';
import { downloadFile } from '../library/command.mjs';
import { basename } from 'node:path';
import File from './file.test.mjs';
import { access, cp, readFile, rm } from 'node:fs/promises';
import server from './server/server.mjs';
import { existsSync } from 'node:fs';

describe('The command', function() {
    this.beforeAll(() => {
        this.server = server.start();
        File.wiktionaryUrl = this.server.address;
        this.tswanaFileUrl = `${File.wiktionaryUrl}wiktionary_tn_all_maxi_2024-06.zim`;
        this.tswanaFile = `${File.dataHome}/${basename(this.tswanaFileUrl)}`;
        this.expectedTswanaFile = `${import.meta.dirname}/server/wiktionary_tn_all_maxi_2024-06.zim`;
        File.dictionaries.tn = basename(this.tswanaFile);
    });
    this.afterAll(async () => {
        this.server.server.close();
        await access(this.tswanaFile).then(() => rm(this.tswanaFile), () => { });
    });
    it('is listed in alphabetical order', async () => {
        const functionNames = Object.keys(commands);
        const sortedFunctionNames = structuredClone(functionNames).sort();
        assert.deepEqual(functionNames, sortedFunctionNames);
    });
    it('can search for dictionaries to download', async () => {
        const tswana = await commands.searchDictionary(['tswana']);
        const error = JSON.stringify(tswana, null, 4);
        assert.ok(typeof tswana === 'object', error);
        const dictionaries = Object.values(tswana).flat();
        assert.ok(dictionaries.length >= 2, error);
        const actualTswanaFileUrl = dictionaries.sort((d1, d2) => d1.size - d2.sie)[0].url;
        const expectedTswanaFileUrl = 'https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_tn_all_maxi_2024-06.zim';
        assert.deepEqual(actualTswanaFileUrl, expectedTswanaFileUrl);
    });
    it('can download a dictionary', async () => {
        await downloadFile(this.tswanaFile, this.tswanaFileUrl);
        const actual = await readFile(this.tswanaFile);
        const expected = await readFile(this.expectedTswanaFile);
        assert.deepEqual(actual, expected);
    }).timeout(8_000);
    it('can search similar words in a dictionary', async () => {
        if (!existsSync(this.tswanaFile)) {
            await cp(this.expectedTswanaFile, this.tswanaFile);
        }
        const matches1 = await commands.search('tn', ['hello'], 1);
        const expected1 = ['dumela'];
        assert.deepEqual(matches1, expected1);

        const matches = await commands.search('tn', ['hello']);
        const expected = ['dumela', 'dumelang'];
        assert.deepEqual(matches, expected);
    });
    it('can save dictionary entries', async () => {
        const file = `${import.meta.dirname}/artifact/dumela.html`;
        await commands.save(file, 'tn', ['dumela']);
        const string = await readFile(file, { encoding: 'utf8' });
        assert.equal(string.length, 3560);
    });
});
