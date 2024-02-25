import fs from "fs/promises";
import { execFileSync, spawnSync, spawn } from "child_process";
import { tmpdir } from "node:os";
import { platform } from "node:os";
import { constants } from "fs";
import pty from "node-pty";
import { stdout, env } from "node:process";
import { filterLanguages } from "./filterLanguages.mjs";
import { rmSync } from "fs";
import { dirname } from "path";
import { Stats } from "node:fs";
import dependencies from "./dependencies.mjs";

const shell = platform() === "win32" ? "powershell.exe" : "bash";

/**
 * @param {string} filePath The path to the file for which to get stats.
 * @returns {Promise<Stats>} The file stats or null if the operation failed.
 */
function stat(filePath) {
    return fs.stat(filePath).then(
        (stats) => stats,
        () => null,
    );
}

/**
 * Copy the file from the source to the destination path. Existing files will
 * not be overwritten.
 *
 * @param {string} sourcePath The path to the file to copy.
 * @param {string} destinationPath The path to the file destination.
 * @returns {Promise} Whether or not the file was copied.
 */
async function copyFile(sourcePath, destinationPath) {
    if (await stat(destinationPath)) {
        throw Error(`Destination file alrady exists: ${destinationPath}`);
    }
    await fs.cp(sourcePath, destinationPath, { recursive: true });
    await fs.chmod(destinationPath, 0o622);
}

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
    let result = await fs.mkdir(downloadDir, { recursive: true }).then(
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
 * @param {string|string[]} zimFiles The zim file from which to retrieve the definition.
 * @param {string[]} phrase The phrase to load.
 * @param {boolean} [postprocess=false] Whether to process the word definition.
 * @param {boolean} [find=false] Whether to process the word definition.
 */
async function view(prefix, zimFiles, phrase, postprocess = false, find = false) {
    // Temporary directory for storing the definition.
    const temporaryDirectory = `${tmpdir()}/${prefix}-`;
    const tempDir = await fs.mkdtemp(temporaryDirectory).then(
        (path) => path,
        () => null,
    );
    if (!tempDir) {
        console.error("Failed to create temporary directory.");
        process.exit(1);
    }
    // Remove the file when exiting the process.
    process.on("exit", () => rmSync(tempDir, { recursive: true }));

    if (Array.isArray(zimFiles)) {
        const paths = [];
        for (const zimFile in zimFiles) {
            const path = await documentLoad(tempDir, zimFiles[zimFile], phrase, `${tempDir}/zwim${zimFile}.html`);
            if (postprocess) {
                await filterLanguages(path);
            }
            paths.push(path);
        }
        documentView(paths, find);
    } else if (typeof zimFiles === "string") {
        const path = await documentLoad(tempDir, zimFiles, phrase);
        if (postprocess) {
            await filterLanguages(path);
        }
        documentView(path);
    }
}

/**
 * Save the zim file entry definition into a temporary file.
 *
 * @param {string} tempDir The file in which to save the entry.
 * @param {string} zimFile The zim file from which to retrieve the definition.
 * @param {string[]} phrase The phrase to load.
 * @returns {Promise<string>} The path to the saved search result.
 */
async function documentLoad(tempDir, zimFile, phrase, tempFile = `${tempDir}/zwim.html`) {
    // local -r IFS=' '
    if (!tempDir || !zimFile || !phrase.length) {
        process.exit(1);
    }
    // Retrieve definition. Replace all phrase spaces with underscores.
    const stdout = execFileSync(dependencies.zimdump, ["show", `--url=${phrase.join("_")}`, zimFile], {
        encoding: "utf-8",
    });
    return await fs.writeFile(tempFile, stdout).then(
        () => tempFile,
        () => null,
    );
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
    // const ptyProcess = pty.spawn(shell, ["w3m"], {
    const args = typeof tempFiles === "string" ? [tempFiles] : ["-N", ...tempFiles];
    const ptyProcess = pty.spawn(dependencies.w3m, args, {
        name: "xterm-color",
        // name: "w3m",
        cols: stdout.columns,
        rows: stdout.rows,
        cwd: env.HOME,
        env: env,
    });

    // Do this to hide error message.
    ptyProcess.listenerCount = () => {};

    process.stdout.on("resize", () => ptyProcess.resize(stdout.columns, stdout.rows));
    ptyProcess.pipe(process.stdout);
    process.stdin.setRawMode(true);
    process.stdin.pipe(ptyProcess);

    ptyProcess.onExit((_code, _signal) => {
        // Restore previous keyboard layout.
        execFileSync(dependencies.fcitx5remote, ["-g", group]);
    });
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
    if (!(await stat(directory))) {
        await fs.mkdir(directory, { recursive: true });
    }
    await fs.writeFile(file, JSON.stringify(object, null, 4));
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
        if (!(await stat(directory))) {
            await fs.mkdir(directory, { recursive: true });
        }
        await fs.writeFile(savePath, text);
    }
    return text;
}

export default {
    copyFile,
    stat,
    downloadFile,
    fetchDocument,
    view,
    saveJson,
    search,
};
