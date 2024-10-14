#!/usr/bin/node
import fs from 'fs';
import { JSDOM } from 'jsdom';

const languages = [
    {
        name: 'english',
        relevant: [
            'English',
            'Russian',
            'Spanish',
            'Japanese',
            'Esperanto',
            'Old_Church_Slavonic',
            'Greek',
            'Latin',
        ],
        url: 'https://en.wiktionary.org',
    },
    {
        name: 'spanish',
        relevant: [
            'Inglés',
            'Español',
            'Ruso',
            'Japonés',
            'Esperanto',
            'Griego',
            'Latín',
        ],
        url: 'https://es.wiktionary.org',
    },
    {
        name: 'russian',
        relevant: [
            'Английский',
            'Русский',
            'Испанский',
            'Японский',
            'Эсперанто',
            'Греческий',
            'Латинский',
        ],
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
            if (translation.innerHTML.toLowerCase().startsWith(language.toLowerCase())) {
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
    const irrelevantLanguages = languages.filter(
        (language) => !relevantLanguages.includes(language.id)
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
    english: function(document, relevantLanguages) {
        const translationHeading = document.getElementById('Translations');
        if (!translationHeading) {
            return;
        }
        // const translationSection =
        //     translationHeading.parentElement.parentElement;
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
    russian: function(document, relevantLanguages) {
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
    spanish: function(document, relevantLanguages) {
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
 */
export async function filterLanguages(inputPath, outputPath = null) {
    if (!inputPath?.length) {
        return console.error('No path to file given.');
    }
    const saved = outputPath ?? inputPath;

    const dom = await JSDOM.fromFile(inputPath);
    const document = dom.window.document;

    const canonical_url = document.querySelector('link[rel=\'canonical\']').href;
    const language = languages
        .filter((language) => canonical_url.startsWith(language.url))
        .pop();

    if (language) {
        filterTranslations[language.name](document, language.relevant);
        filterIrrelevantLanguages(document, language.relevant);
    } else {
        console.log(`No filter function associated to ${JSON.stringify(new URL(canonical_url).origin)}`);
    }
    fs.writeFileSync(saved, document.body.innerHTML);
}

