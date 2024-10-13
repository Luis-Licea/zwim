#!/usr/bin/node
import fs from 'fs';
import { JSDOM } from 'jsdom';

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

    const languages = [
        {
            name: 'English',
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
            name: 'Spanish',
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
            name: 'Russian',
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

    const canonical_url = document.querySelector('link[rel=\'canonical\']').href;
    const language = languages
        .filter((language) => canonical_url.startsWith(language.url))
        .pop();
    // const relevantLanguages = language.relevant;

    /**
     * @param {[string]} relevantLanguages The relevant languages.
     * @param {[HTMLElement]} translations The list of translations.
     * @returns {[HTMLElement]} The list of irrelevant translations.
     */
    function filterOutRelevant(relevantLanguages, translations) {
        return translations.filter((translation) => {
            for (const language of relevantLanguages) {
                if (
                    translation.innerHTML
                        .toLowerCase()
                        .startsWith(language.toLowerCase())
                ) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * @param {[string]} relevantLanguages The list of languages to keep in the
     * Wiktionary translation tables. The rest will be removed.
     */
    function filterEnlgishTranslations(relevantLanguages) {
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
    }

    /**
     * @param {[string]} relevantLanguages The list of languages to keep in the
     * Wiktionary translation tables. The rest will be removed.
     */
    function filterRussianTranslations(relevantLanguages) {
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
    }

    /**
     * @param {[string]} relevantLanguages The list of languages to keep in the
     * Wiktionary translation tables. The rest will be removed.
     */
    function filterSpanishTranslations(relevantLanguages) {
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
    /**
     * @param {[string]} relevantLanguages The list of languages to keep in the
     * Wiktionary article. The rest will be removed.
     */
    function filterLanguages(relevantLanguages) {
        const languages = [...document.querySelectorAll('details summary h2')];
        const irrelevantLanguages = languages.filter(
            (language) => !relevantLanguages.includes(language.id)
        );
        for (const language of irrelevantLanguages) {
            const languageDetails = language.parentElement.parentElement;
            languageDetails.remove();
        }
    }

    if (language.name == 'English') {
        filterEnlgishTranslations(language.relevant);
    } else if (language.name == 'Russian') {
        filterRussianTranslations(language.relevant);
    } else if (language.name == 'Spanish') {
        filterSpanishTranslations(language.relevant);
    }
    filterLanguages(language.relevant);
    fs.writeFileSync(saved, document.body.innerHTML);
}
