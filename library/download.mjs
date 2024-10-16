import { JSDOM } from 'jsdom';
import { basename } from 'node:path';

function sortByDate(dictionary1, dictionary2) {
    return dictionary2.date - dictionary1.date;
}

/**
 * @param {string} htmlFile The path to the HTML file or URL path to scrape for
 * valid download links.
 * @returns {Promise<object>} [TODO:description]
 */
export default async function scrape(htmlFile) {
    const isUrl = htmlFile.match(/^[a-zA-Z]+:\/\//);
    const dom = isUrl ? await JSDOM.fromURL(htmlFile) : await JSDOM.fromFile(htmlFile);
    const document = dom.window.document;

    function getLinks(document) {
        const anchors = [...document.querySelectorAll('a')];
        // anchors.shift(); // The first link is invalid.
        const links = anchors.map((anchor) => anchor.href);
        return links;
    }

    function getTexts(document) {
        const ORDERED_NODE_SNAPSHOT_TYPE = 7;
        const textSnapshot = document.evaluate('/html/body/pre/text()', document, null, ORDERED_NODE_SNAPSHOT_TYPE);

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

    for (const key in links) {
        if (!key.endsWith('.zim')) {
            delete links[key];
            continue;
        }
        const text = links[key];
        const value = {
            url: key,
            date: undefined,
            bytes: undefined,
            basename: undefined,
            localeIso: undefined,
        };
        links[key] = value;
        value.basename = basename(key);
        value.localeIso = value.basename.match(/wiktionary_(?<localeIso>...?)_.*/)?.groups?.localeIso;

        const group = text.match(/^\s+(?<date>\S+\s+\S+)\s+(?<bytes>\d+)\s+$/)?.groups ?? {};
        value.bytes = parseInt(group.bytes);
        value.date = new Date(group.date);
    }

    const entries = {};
    // Ensure every value is defined.
    for (const [key, value] of Object.entries(links)) {
        if (Object.values(value).some((value) => !value)) {
            const object = JSON.stringify({ [key]: value }, null, 4);
            throw Error(`Missing keys: \n${object}`);
        }
        entries[value.localeIso] ??= [];
        entries[value.localeIso].push(value);
        delete value.localeIso;
    }

    for (const entry of Object.values(entries)) {
        entry.sort(sortByDate);
    }

    return entries;
}
