import { JSDOM } from "jsdom";
import { basename } from "path";

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

/**
 * @param {string} htmlFile The path to the HTML file or URL path to scrape for
 * valid download links.
 * @returns {Promise<object>} [TODO:description]
 */
export default async function scrape(htmlFile) {
    const isUrl = htmlFile.match(/^[a-zA-Z]+:\/\//);
    const dom = isUrl
        ? await JSDOM.fromURL(htmlFile)
        : await JSDOM.fromFile(htmlFile);
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

    const languageNames = new Intl.DisplayNames(["en"], { type: "language", fallback: "none" });
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
        if (value.languageIso === "nah") {
            value.languageIso = "Nahuatl";
            value.language = value.languageIso;
        } else if (value.languageIso === "guw") {
            value.languageIso = "Gun-Gbe";
            value.language = value.languageIso;
        } else if (value.languageIso) {
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
            const object = JSON.stringify({ [key]: value }, null, 4);
            throw Error(`Missing keys: \n${object}`);
        }
        entries[value.languageIso] ??= [];
        entries[value.languageIso].push(value);
    }
    return entries;
}
