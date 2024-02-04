import assert from "node:assert/strict";
import scrape from "../library/download.mjs";
import command from "../library/command.mjs";

const htmlContents = `${import.meta.dirname}/html/dumps.wikimedia.org.html`;
const wiktionaryUrl = "https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/";
const file =
    "https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_af_all_maxi_2023-12.zim";

// const request =  await fetch(file, {method: "HEAD"});
// const headers = [...request.headers.entries()]
// const supportsPartialDownload = request.headers.get("accept-ranges") === "bytes";
// const fileSize = request.headers.get("content-length")

if (!(await command.stat(htmlContents))) {
    await command.fetchDocument(wiktionaryUrl, htmlContents);
}

it("scrape dictionary URLs", async () => {
    const entries = await scrape(htmlContents);
    await command.saveJson(entries, `${import.meta.dirname}/artifact/entries.json`);
    const languages = Object.keys(entries);
    const urlEntries = Object.values(entries);

    // Assume that every field is truthy, meaning no field is 0, undefined, or
    // null.
    for (const entry of urlEntries) {
        Object.values(entry).every(assert.ok);
    }

    assert.strictEqual(languages.length, 145);
});
