import assert from 'node:assert/strict';
import scrape from '../library/scrapeDownloadLinks.mjs';
import command from '../library/command.mjs';
import { existsSync } from 'node:fs';
import * as zwim from '../configuration/zwim.mjs';
import { File as Settings } from '../library/file.mjs';
import { basename } from 'node:path';
import { readFile } from 'node:fs/promises';

const File = new Settings({ ...zwim, cacheHome: `${import.meta.dirname}/html/` });

// const file =
//     'https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_af_all_maxi_2023-12.zim';

// const request =  await fetch(file, {method: "HEAD"});
// const headers = [...request.headers.entries()]
// const supportsPartialDownload = request.headers.get("accept-ranges") === "bytes";
// const fileSize = request.headers.get("content-length")

if (!existsSync(File.languageListHtml)) {
    await command.fetchDocument(File.wiktionaryUrl, File.languageListHtml);
}

it('scrape dictionary URLs', async () => {
    const actual = await scrape({ file: File.languageListHtml, url: File.wiktionaryUrl });
    await command.saveJson(actual, `${import.meta.dirname}/artifact/${basename(File.languageListJson)}`);
    const expected = JSON.parse(await readFile(File.languageListJson), (key, value) => key === 'date' ? new Date(value) : value);
    assert.deepEqual(actual, expected);
});
