import { dirname } from "path";
import { fileURLToPath } from "url";

export function getFilePath(metaUrl) {
    return fileURLToPath(metaUrl);
}

export function getDirPath(metaUrl) {
    return dirname(getFilePath(metaUrl));
}
