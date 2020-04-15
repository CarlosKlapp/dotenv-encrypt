import _ from "lodash";
import * as JsDiff from "diff";
import * as deepDiff from "deep-object-diff";
import { loadBufferFromFile, loadObjectFromFile } from "../src/util";

/**
 * Compare two text files or Buffers are equal.
 *
 * @returns match: TRUE if identical. FALSE if they don't match.
 */
export const compareTextFile = (
    bufferOrFilePath1: string | Buffer,
    bufferOrFilePath2: string | Buffer
): { match: boolean; text1: string; text2: string; diffs: JsDiff.Change[] } => {
    const text1: string = loadBufferFromFile(bufferOrFilePath1);
    const text2: string = loadBufferFromFile(bufferOrFilePath2);
    const diffs: JsDiff.Change[] = JsDiff.diffWords(text1, text2);
    const match: boolean = _.isEqual(text1, text2);
    return { match, text1, text2, diffs };
};

/**
 * Compare two JSON files or JSON objects are equal.
 *
 * @returns match: TRUE if identical. FALSE if they don't match.
 */
export const compareJsonFile = (
    objectOrFilePath1: string | object,
    objectOrFilePath2: string | object
): { match: boolean; obj1: object; obj2: object; diffs: object } => {
    const obj1: object = loadObjectFromFile(objectOrFilePath1);
    const obj2: object = loadObjectFromFile(objectOrFilePath2);
    const match: boolean = _.isEqual(obj1, obj2);
    const diffs = deepDiff.detailedDiff(obj1, obj2);
    return { match, obj1, obj2, diffs };
};
