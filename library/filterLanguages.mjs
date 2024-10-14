#!/usr/bin/node
import { JSDOM } from 'jsdom';
import { writeFile } from 'node:fs/promises';

const iso = {
    english: 'en',
    russian: 'ru',
    spanish: 'es',
    japanese: 'ja',
    esperanto: 'eo',
    // It should be 'Old_Church_Slavonic'. This creates problems.
    churchSlavonic: 'cu',
    greek: 'el',
    latin: 'la',
};

const languages = [
    {
        name: iso.english,
        url: 'https://en.wiktionary.org',
    },
    {
        name: iso.spanish,
        url: 'https://es.wiktionary.org',
    },
    {
        name: iso.russian,
        url: 'https://ru.wiktionary.org',
    },
];

/**
 * @param {[string]} relevantLanguages The relevant languages.
 * @param {[HTMLElement]} translations The list of translations.
 * @returns {[HTMLElement]} The list of irrelevant translations.
 */
function filterOutRelevant(relevantLanguages, translations) {
    return translations.filter((translation) => {
        for (const language of relevantLanguages) {
            const translationLanguage = translation.innerHTML.slice(0, translation.innerHTML.indexOf(':'));
            // Use toLowerCase().endsWith() so that "Church Slavonic" matches "old church
            // slavonic".
            if (translationLanguage.toLowerCase().endsWith(language)) {
                return false;
            }
        }
        return true;
    });
}

/**
 * @param {HTMLElement} document The Wiktionary page element.
 * @param {[string]} relevantLanguages The list of languages to keep in the
 * Wiktionary article. The rest will be removed.
 */
function filterIrrelevantLanguages(document, relevantLanguages) {
    const languages = [...document.querySelectorAll('details summary h2')];
    // Use toLowerCase().replace('_', ' ') so that "Church Slavonic" matches
    // "Old_Church_Slavonic".
    const irrelevantLanguages = languages.filter(
        (language) => !relevantLanguages.includes(language.id.toLowerCase().replace('_', ' '))
    );
    for (const language of irrelevantLanguages) {
        const languageDetails = language.parentElement.parentElement;
        languageDetails.remove();
    }
}

const filterTranslations = {
    /**
     * @param {HTMLElement} document The Wiktionary page element.
     * @param {[string]} relevantLanguages The list of languages to keep in the
     * Wiktionary translation tables. The rest will be removed.
     */
    [iso.english]: function(document, relevantLanguages) {
        const translationHeading = document.getElementById('Translations');
        if (!translationHeading) {
            return;
        }
        const translations = [
            ...document.querySelectorAll('tbody tr td ul li'),
        ];
        const irrelevantTranslations = filterOutRelevant(
            relevantLanguages,
            translations
        );
        irrelevantTranslations.map((translation) => translation.remove());
    },

    /**
     * @param {HTMLElement} document The Wiktionary page element.
     * @param {[string]} relevantLanguages The list of languages to keep in the
     * Wiktionary translation tables. The rest will be removed.
     */
    [iso.russian]: function(document, relevantLanguages) {
        const translationHeading = document.getElementById('Перевод');
        if (!translationHeading) {
            return;
        }
        const translationSection =
            translationHeading.parentElement.parentElement;
        const translations = [
            ...translationSection.querySelectorAll(
                'tbody tr td div li a:first-child'
            ),
        ];
        const irrelevantTranslations = filterOutRelevant(
            relevantLanguages,
            translations
        );
        irrelevantTranslations.map((translation) =>
            translation.parentElement.remove()
        );
    },
    /**
     * @param {HTMLElement} document The Wiktionary page element.
     * @param {[string]} relevantLanguages The list of languages to keep in the
     * Wiktionary translation tables. The rest will be removed.
     */
    [iso.spanish]: function(document, relevantLanguages) {
        const translationHeading = document.getElementById('Traducciones');
        if (!translationHeading) {
            return;
        }
        const translations = [
            ...document.querySelectorAll('tbody tr td ul li > :first-child')
        ];
        const irrelevantTranslations = filterOutRelevant(
            relevantLanguages,
            translations
        );
        irrelevantTranslations.map((translation) =>
            translation.parentElement.remove()
        );
    }
};

/**
 * @param {string} inputPath The path to the HTML Wiktionary entry to modify.
 * @param {string?} outputPath The path where the modified HTML file will be
 * saved. If no output path is given, the file will be modified in-place.
 * @param {string[]} relevantTranslations The translations to keep.
 */
export async function filterLanguages(inputPath, outputPath = null, relevantTranslations = Object.values(iso)) {
    if (!inputPath?.length) {
        throw Error('No path to file given.', { cause: { outputPath } });
    }
    if (!relevantTranslations) {
        throw Error('No relevant translations to fildter', { cause: { relevantTranslations } });
    }
    const saved = outputPath ?? inputPath;

    const dom = await JSDOM.fromFile(inputPath);
    const document = dom.window.document;

    const canonical_url = document.querySelector('link[rel=\'canonical\']').href;
    const language = languages
        .filter((language) => canonical_url.startsWith(language.url))
        .pop();

    if (language) {
        const languageDisplay = new Intl.DisplayNames([language.name], { type: 'language' });
        const relevantLanguages = relevantTranslations.map(iso => languageDisplay.of(iso).toLowerCase());
        filterTranslations[language.name](document, relevantLanguages);
        filterIrrelevantLanguages(document, relevantLanguages);
    } else {
        console.log(`No filter function or relevant translations associated to ${JSON.stringify(new URL(canonical_url).origin)}`);
    }
    await writeFile(saved, document.body.innerHTML);
}

