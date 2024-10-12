import { mkdir, mkdtemp, writeFile } from "fs/promises";
import { execFileSync, spawnSync } from "child_process";
import { tmpdir } from "node:os";
import { filterLanguages } from "./filterLanguages.mjs";
import { rmSync, existsSync } from "fs";
import { dirname } from "path";
import dependencies from "./dependencies.mjs";


/**
 * Download a given URL into the given directory without overwriting files.
 *
 * @param {string} downloadDir The path to the directory where the file will be
 * downloaded.
 * @param {string} downloadUrl The URL of the file to download.
 * @returns {Promise<boolean>} Whether creating the directory and downloading the file
 * was successful.
 */
async function downloadFile(downloadDir, downloadUrl) {
    if (!downloadDir || !downloadUrl) {
        return false;
    }
    let result = await mkdir(downloadDir, { recursive: true }).then(
        () => true,
        () => false,
    );
    // /usr/bin/env curl --fail --remote-name --location --output-dir "$download_dir" --continue-at - "$download_url"
    return result;
}

// const startRange = 4000;
// const endRange = Number.MAX_SAFE_INTEGER;
//
// const response = await request(url, {
//     method: 'GET',
//     headers: {
//         'Accept-Ranges': 'arraybuffer',
//         "Response-Type": 'arraybuffer',
//         "Range": `bytes=${startRange}-${endRange},`
//     }
// });

/**
 * Save the zim file entry definition into a temporary file. This function is
 * also responsible for cleaning up the temporary file before exiting.
 *
 * The path to the optional executable that will alter the definition. Pass an empty string or false if not interested in preprocessing.
 *
 * @param {string} prefix The temporary directory to use.
 * @param {{[string: language]: string}} zimFiles The zim file from which to retrieve the definition.
 * @param {string[]} phrase The phrase to load.
 * @param {boolean} [postprocess=false] Whether to process the word definition.
 * @param {boolean} [find=false] Whether to process the word definition.
 */
async function view(prefix, zimFiles, phrase, postprocess = false, find = false) {
    // Temporary directory for storing the definition.
    const folderPrefix = `${tmpdir()}/${prefix}-`;
    const temporaryFolder = await mkdtemp(folderPrefix).then(
        (path) => path,
        () => null,
    );
    if (!temporaryFolder) {
        console.error("Failed to create temporary directory.");
        process.exit(1);
    }
    // Remove the file when exiting the process.
    process.on("exit", () => rmSync(temporaryFolder, { recursive: true }));

    const paths = [];
    for (const zimFile in zimFiles) {
        const path = await documentLoad(`${temporaryFolder}/${zimFile}.html`, zimFiles[zimFile], phrase);
        if (postprocess) {
            await filterLanguages(path);
        }
        paths.push(path);
    }
    documentView(paths, find);
}

/**
 * Save the zim file entry definition into a temporary file.
 *
 * @param {string} tempFile The file in which to save the entry.
 * @param {string} zimFile The zim file from which to retrieve the definition.
 * @param {string[]} phrase The phrase to load.
 * @returns {Promise<string?>} The path to the saved search result.
 */
export async function documentLoad(tempFile, zimFile, phrase) {
    if (!tempFile || !zimFile || !phrase.length) {
        throw Error("Missing arguments", { cause: { temporryFolder: path, zimFile, phrase } })
    }
    const args = ["show", `--url=${phrase.join("_")}`, zimFile];
    // Retrieve definition. Replace all phrase spaces with underscores.
    const output = spawnSync(dependencies.zimdump, args, { encoding: "utf8" });
    if (output.status) {
        if (output.stderr.includes("Entry not found")) {
            console.error(await search(zimFile, phrase));
        } else {
            console.error(output.stderr.trimEnd());
            console.error([dependencies.zimdump, ...args]);
        }
        process.exit(output.status)
    }
    return await writeFile(tempFile, output.stdout).then(() => tempFile);
}

/**
 * View the file contents.
 *
 * @param {string|string[]} tempFiles The path to the file to view.
 * @param {boolean} [join=false] Whether to join the word definition.
 */
function documentView(tempFiles, join = false) {
    // Store current keyboard layout: w3m controls work with a Latin alphabet.
    // local -r group="$(/usr/bin/env fcitx5-remote -q)"
    const group = execFileSync(dependencies.fcitx5remote, ["-q"]);
    // Set keyboard to English so that navigation controls work in w3m.
    // /usr/bin/env fcitx5-remote -g English
    execFileSync(dependencies.fcitx5remote, ["-g", "English"]);
    // Display the definition.
    const args = typeof tempFiles === "string" ? [tempFiles] : ["-N", ...tempFiles];
    const output = spawnSync(dependencies.w3m, args, { encoding: "utf8", stdio: "inherit" });
    // Restore previous keyboard layout.
    execFileSync(dependencies.fcitx5remote, ["-g", group]);
    if (output.status) {
        throw Error("Error executing w3m", { cause: output });
    }
}

/**
 * Search a phrase in the given zim file and return similar entries.
 *
 * @param {string} zimFile The zim file in which to search.
 * @param {string[]} phrase The words to look for in the zim file.
 * @returns {Promise<string>}
 */
async function search(zimFile, phrase) {
    const result = execFileSync(dependencies.zimsearch, [zimFile, phrase.join(" ")], {
        encoding: "utf8",
    });
    return result
        .split("\n")
        .filter((line) => line.includes(":"))
        .map((line) => line.slice(line.lastIndexOf("\t") + 1));
}

/**
 * @param {object} object The JSON object to save.
 * @param {string} file The path to the file where to save the serialized
 * object.
 */
export async function saveJson(object, file) {
    const directory = dirname(file);
    if (!existsSync(directory)) {
        await mkdir(directory, { recursive: true });
    }
    await writeFile(file, JSON.stringify(object, null, 4));
}

/**
 * @param {string} url The url contents to fetch.
 * @param {string?} savePath The optional path where to save the fetched text.
 * @returns {Promise<string>} The URL contents.
 */
export async function fetchDocument(url, savePath = null) {
    const websiteResponse = await fetch(url);
    const text = await websiteResponse.text();
    if (savePath) {
        const directory = dirname(savePath);
        if (!existsSync(directory)) {
            await mkdir(directory, { recursive: true });
        }
        await writeFile(savePath, text);
    }
    return text;
}

export default {
    documentLoad,
    downloadFile,
    fetchDocument,
    view,
    saveJson,
    search,
};
