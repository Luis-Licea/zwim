import { writeFile, readFile, mkdir, stat } from "fs/promises";
import { JSDOM } from "jsdom";
import { basename } from "path";

const website = "https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/";
const file =
    "https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/wiktionary_af_all_maxi_2023-12.zim";

// const request =  await fetch(file, {method: "HEAD"});
// const headers = [...request.headers.entries()]
// const supportsPartialDownload = request.headers.get("accept-ranges") === "bytes";
// const fileSize = request.headers.get("content-length")
//
const supportsPartialDownload = true;
const fileSize = 43753956;

/**
 * Format the file size in B, MB, or GB.
 *
 * @param {number} fileSize The file size in bytes.
 * @returns {{0: string, 1: number}} The units, and the formatted file size.
 */
function formatSize(fileSize) {
    const units = {
        GB: fileSize / 1e9,
        MB: fileSize / 1e6,
        B: fileSize / 1e3,
    };

    const [unit, value] = Object.entries(units)
        .filter(([_, value]) => value >= 1)
        .shift();
    return `${value.toFixed(2)} ${unit}`;
}

// console.log({unit, value})

// console.log(supportsPartialDownload, fileSize)

// const websiteResponse = await fetch("https://dumps.wikimedia.org/other/kiwix/zim/wiktionary/")
// const text = await websiteResponse.text();
// await writeFile(htmlFile, text)
// const text = await readFile(htmlFile);
async function scrape(htmlFile) {
    const dom = await JSDOM.fromFile(htmlFile);
    const document = dom.window.document;

    function getLinks(document) {
        const anchors = [...document.querySelectorAll("a")];
        // anchors.shift(); // The first link is invalid.
        const links = anchors.map((anchor) => anchor.href);
        return links;
    }

    function getTexts(document) {
        const ORDERED_NODE_SNAPSHOT_TYPE = 7;
        const textSnapshot = document.evaluate(
            "/html/body/pre/text()",
            document,
            null,
            ORDERED_NODE_SNAPSHOT_TYPE,
        );

        const text = [];
        for (let i = 0; i < textSnapshot.snapshotLength; i++) {
            text.push(textSnapshot.snapshotItem(i).textContent);
        }
        // text.shift(); // The first link is invalid: ..
        return text;
    }

    const urls = getLinks(document);
    const urlTexts = getTexts(document);
    const urlAndText = urls.map((url, index) => [url, urlTexts[index]]);
    const links = Object.fromEntries(urlAndText);

    const languageNames = new Intl.DisplayNames(["en"], { type: "language" });
    for (const key in links) {
        if (!key.endsWith(".zim")) {
            delete links[key];
            continue;
        }
        const text = links[key];
        const value = {
            url: key,
            rawDate: undefined,
            date: undefined,
            bytes: undefined,
            size: undefined,
            basename: undefined,
            languageIso: undefined,
            language: undefined,
        };
        links[key] = value;
        value.basename = basename(key);
        value.languageIso = value.basename.match(
            /wiktionary_(?<languageIso>...?)_.*/,
        )?.groups?.languageIso;
        if (value.languageIso) {
            value.language = languageNames.of(value.languageIso);
        }

        try {
            const group =
                text.match(/^\s+(?<date>\S+\s+\S+)\s+(?<bytes>\d+)\s+$/)
                    ?.groups ?? {};
            value.rawDate = group.date;
            if (group.bytes) {
                value.bytes = parseInt(group.bytes);
                value.size = formatSize(group.bytes);
            }
        } catch (error) {
            console.error(error);
        }
        if (value.rawDate) {
            value.date = new Date(value.rawDate).toLocaleString();
        }
    }

    const entries = {};
    // Ensure every value is defined.
    for (const [key, value] of Object.entries(links)) {
        if (Object.values(value).some((value) => !value)) {
            console.log({ [key]: value });
        }
        entries[value.language] ??= [];
        entries[value.language].push(value);
    }
    return entries;
}
const htmlFile = `${import.meta.dirname}/html/dumps.wikimedia.org.html`;
const entries = await scrape(htmlFile);

const artifactFolder = `${import.meta.dirname}/artifact`;

function exists(path) {
    return stat(path).then(
        () => true,
        () => false,
    );
}

if (!(await exists(artifactFolder))) {
    await mkdir(artifactFolder);
}

await writeFile(
    `${artifactFolder}/entries.json`,
    JSON.stringify(entries, null, 4),
);
