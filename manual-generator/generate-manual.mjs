#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'fs/promises';
import { basename, resolve } from 'node:path';

/** @type{import("../package.json")} */
const packageJson = JSON.parse(await readFile(`${import.meta.dirname}/../package.json`));

function sh(command, options = {}) {
    return spawnSync(command, { stdio: 'inherit', shell: true, ...options, });
}

const capitalize = sstring => sstring[0].toUpperCase() + sstring.slice(1);

/**
 * Return a quoted string that escapes spaces for execution in Bash.
 *
 * @param {string} string The string to quote for executing in Bash.
 * @returns {string} The quoted string.
 */
function quote(string) {
    if (string === '') {
        return '\'\'';
    }
    if (!/[^%+,-./:=@_0-9A-Za-z]/.test(string)) {
        return string;
    }
    return '\'' + string.replace(/'/g, '\'"\'') + '\'';
}

/**
 * Return a string quoted for executing in bash.
 *
 * @param {string[]} strings The string pieces.
 * @param {string[]} values The interpolated values.
 */
function $(strings, ...values) {
    return values.reduce((string, current, index) => `${string}${strings[index]}${quote(current)}`, '') + strings.at(-1);
}

const input = `${import.meta.dirname}/zwim.1.md`;
const outputFolder  = resolve(`${import.meta.dirname}/../manual`);
const output = `${outputFolder}/${basename(input, '.md')}`;
sh($`ronn --roff --manual="${capitalize(packageJson.name)} Manual" --organization=${packageJson.author} ${input} --output-dir ${outputFolder}`);

const file = await readFile(output, { encoding: 'utf8' });
const now = new Date();
const yyyymmdd = now.toISOString().split('T')[0];
const replacedDate = file.replace('January 1980', yyyymmdd);
await writeFile(output, replacedDate);
