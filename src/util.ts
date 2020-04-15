import path from "path";
import glob from "glob";
import _ from "lodash";
import fs from "fs";

const fixParsedPath = (parsedPath: path.ParsedPath): path.ParsedPath => {
    if (parsedPath.base === ".") {
        parsedPath.base = "";
        parsedPath.name = "";
        parsedPath.ext = "";
    } else if (parsedPath.base === "..") {
        parsedPath.base = "";
        parsedPath.name = "";
        parsedPath.ext = "";
        parsedPath.dir = "..";
        parsedPath.root = "";
    }

    if (parsedPath.dir === ".") {
        parsedPath.dir = "";
        parsedPath.root = "";
    }
    return parsedPath;
};

const handleDestPathSpecifiedAsFolder = (
    src: path.ParsedPath,
    _dest: path.ParsedPath,
    defaultFileName: string,
    ext?: string
): path.FormatInputPathObject => {
    const res: path.FormatInputPathObject = {};

    if (_.isEmpty(src.base)) {
        res.name = defaultFileName;
    } else {
        res.name = src.base;
    }

    if (!_.isEmpty(ext)) {
        res.ext = ext;
    }

    return res;
};

const handleDestPathSpecifiedAsFile = (
    src: path.ParsedPath,
    dest: path.ParsedPath,
    defaultFileName: string,
    ext?: string
): path.FormatInputPathObject => {
    const res: path.FormatInputPathObject = {};

    res.dir = dest.dir;
    if (_.isEmpty(dest.base)) {
        res.name = _.isEmpty(src.base) ? defaultFileName : src.base;
        res.ext = ext;
        return res;
    }

    if (_.isEmpty(ext)) {
        res.base = dest.base;
        return res;
    }

    if (_.isEmpty(dest.ext)) {
        res.name = dest.name;
        res.ext = ext;
        return res;
    }

    res.name = dest.base;
    if (dest.ext !== ext) {
        res.ext = ext;
    }

    return res;
};
/**
 * Create a new path using the destination folder and original file name.
 *
 * @param filePath - original file path
 * @param destinationPath - destination folder
 * @returns path using the destination folder and original file name
 */ export const replaceFilePath = (
    filePath: string,
    destinationPath: string,
    ext?: string
): string => {
    let src = path.parse(filePath);
    let dest = path.parse(destinationPath);
    const DEFAULT_FILE_NAME = "defaultFileName";
    let res: path.FormatInputPathObject = {};

    src = fixParsedPath(src);
    dest = fixParsedPath(dest);

    if (destinationPath.endsWith("/")) {
        res.dir =
            dest.dir === dest.root
                ? `${dest.dir}${dest.base}`
                : `${dest.dir}${path.sep}${dest.base}`;
        // res = { ...res, handleDestPathSpecifiedAsFolder(src, dest, DEFAULT_FILE_NAME, ext) };
        res = { ...res, ...handleDestPathSpecifiedAsFolder(src, dest, DEFAULT_FILE_NAME, ext) };
    } else {
        res = handleDestPathSpecifiedAsFile(src, dest, DEFAULT_FILE_NAME, ext);
    }

    // pathObject.root is ignored if pathObject.dir is provided
    // pathObject.ext and pathObject.name are ignored if pathObject.base exists
    const pathResult = path.format(res);
    const pathResolved = path.normalize(pathResult);
    return pathResolved;
};

// replaceFilePath("/foo", "/");

/**
 * Create the backup file path. The new file name includes the extension of ".bak"
 *
 * @param filePath - original file path
 * @param destinationPath - destination folder
 * @returns path using the destination folder and original file name plus ".bak"
 */
export const createBackupFilePath = (filePath: string, destinationPath: string): string => {
    return replaceFilePath(filePath, destinationPath, ".bak");
};

// createBackupFilePath("/sub1/sub2/foo.foo.foo", "/bart/simpson/foo.foo.foo");
// createBackupFilePath("/", "/");

/**
 * Search for files using the specified pattern
 *
 * @param filePatterns The double-star character ** is supported by default
 * @returns array of files found including paths
 * @see https://www.npmjs.com/package/glob
 */
export const fileGlob = (filePatterns: string[]): string[] => {
    let files: string[] = [];
    filePatterns.forEach((f) => {
        const g = glob.sync(f, {
            absolute: true,
            dot: true,
            nodir: true,
            ignore: ["**/.DS_Store"],
        });
        files = _.union(files, g).sort();
    });
    return files;
};

/**
 * Recursively sort an object by the property keys names.
 *
 * @param obj
 * @returns sorted object
 */
export const sortObjectByKeys = (obj: object): any => {
    let pairs = _.toPairsIn(obj).sort((a, b) => a[0].localeCompare(b[0]));

    // Recursively sort objects. Ignore arrays
    for (let i = 0; i < pairs.length; i++) {
        if (_.isObject(pairs[i][1]) && !_.isArray(pairs[i][1])) {
            pairs[i][1] = sortObjectByKeys(pairs[i][1]);
        }
    }

    const sortedObject = _.fromPairs(pairs);
    return sortedObject;
};

export const loadBufferFromFile = (bufferOrFilePath: string | Buffer): string => {
    // Expand if statement to make it easier to read code coverage
    let text: string;
    if (bufferOrFilePath instanceof Buffer) {
        text = bufferOrFilePath.toString();
    } else {
        text = fs.readFileSync(bufferOrFilePath, "utf8");
    }
    return text;
};

export const loadObjectFromFile = (objectOrFilePath: string | object): object => {
    // Expand if statement to make it easier to read code coverage
    let obj: object;
    if (typeof objectOrFilePath === "string") {
        obj = JSON.parse(fs.readFileSync(objectOrFilePath, "utf8"));
    } else {
        obj = objectOrFilePath;
    }
    return obj;
};
