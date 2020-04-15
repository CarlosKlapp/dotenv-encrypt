#!/usr/bin/env node

import _ from "lodash";
import { parseArgs, ParsedArgsDataType } from "./args";
import { CryptoKeyManager } from "./crypto_key_manager";
import { DotenvProcessor } from "./dotenv_processor";
import { Feedback, coerceFeedbackPathsToRelativePaths } from "./feedback";
import { replaceFilePath, fileGlob, sortObjectByKeys } from "./util";
import { StatusCryptoWrapperResult } from "./crypto_wrapper";
import fs from "fs";
// import path from "path";
import assert from "assert-plus";

// Entire file needs to be refactored
// Begin refactoring
//
// export const convertCommandLineTupleToBuffer = (keyvalue: string): Buffer => {
//     // Convert the command line string into a buffer
//     // The user passed in a single param, eg.
//     //      UNENCRYPTED__DEV__EMAIL_API=EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c
//     //      CIPHERED__DEV__EMAIL_API=FhdQgQOC6th8fmti.IBxk8vKOTR4nYHPhDEJVB8ql7EW4rkd/tTxbXREjuMPrsoE0cbxu.JOv1f+AODXEUOUoACmgAQg==
//     return Buffer.from(keyvalue);
// };

// export const convertCommandLineTripleToBuffer = (
//     key: string,
//     name: string,
//     value: string,
//     isEncryption: boolean
// ) => {
//     // The user passed in three params, eg.
//     //      DEV EMAIL_API EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c
//     //      DEV EMAIL_API FhdQgQOC6th8fmti.IBxk8vKOTR4nYHPhDEJVB8ql7EW4rkd/tTxbXREjuMPrsoE0cbxu.JOv1f+AODXEUOUoACmgAQg==
//     return isEncryption
//         ? Buffer.from(`UNENCRYPTED__${key}__${name}=${value}`)
//         : Buffer.from(`CIPHERED__${key}__${name}=${value}`);
// };

// const encryptDecryptCommandLine = (
//     buffer: Buffer,
//     isEncryption: boolean,
//     cryptoKeyManager: CryptoKeyManager,
//     forceIvToFixedValue: boolean
// ): void => {
//     const dotenvProcessor = new DotenvProcessor(cryptoKeyManager, buffer, forceIvToFixedValue);

//     const res = isEncryption ? dotenvProcessor.encrypt() : dotenvProcessor.decrypt();

//     // Check the results of the encryption/decryption
//     res.forEach((x) => {
//         if (x.status === StatusCryptoWrapperResult.success) {
//             console.log(`${x.newDotenvVariableName}=${x.result}`);
//         } else {
//             console.log(x.failureExplanation);
//         }
//     });
// };

const convertCommandLineToBuffer = (args: ParsedArgsDataType, isEncryption: boolean) => {
    let buffer: Buffer;
    // Convert the command line string into a buffer
    if (args.keyvalue) {
        // The user passed in a single param, eg.
        //      UNENCRYPTED__DEV__EMAIL_API=EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c
        //      CIPHERED__DEV__EMAIL_API=FhdQgQOC6th8fmti.IBxk8vKOTR4nYHPhDEJVB8ql7EW4rkd/tTxbXREjuMPrsoE0cbxu.JOv1f+AODXEUOUoACmgAQg==
        buffer = Buffer.from(args.keyvalue as string);
        return buffer;
    }

    assert.ok(args.key && args.name && args.value);
    // The user passed in three params, eg.
    //      DEV EMAIL_API EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c
    //      DEV EMAIL_API FhdQgQOC6th8fmti.IBxk8vKOTR4nYHPhDEJVB8ql7EW4rkd/tTxbXREjuMPrsoE0cbxu.JOv1f+AODXEUOUoACmgAQg==
    buffer = isEncryption
        ? Buffer.from(`UNENCRYPTED__${args.key}__${args.name}=${args.value}`)
        : Buffer.from(`CIPHERED__${args.key}__${args.name}=${args.value}`);
    return buffer;
};

const encryptDecryptCommandLine = (
    args: ParsedArgsDataType,
    cryptoKeyManager: CryptoKeyManager,
    forceIvToFixedValue: boolean
): void => {
    const isEncryption = ["xenc", "kenc"].includes(args._[0]);
    let buffer: Buffer = convertCommandLineToBuffer(args, isEncryption);

    const dotenvProcessor = new DotenvProcessor(cryptoKeyManager, buffer, forceIvToFixedValue);

    const res = isEncryption ? dotenvProcessor.encrypt() : dotenvProcessor.decrypt();

    // Check the results of the encryption/decryption
    res.forEach((x) => {
        if (x.status === StatusCryptoWrapperResult.success) {
            console.log(`${x.newDotenvVariableName}=${x.result}`);
        } else {
            console.log(x.failureExplanation);
        }
    });
};

const processDotenvFilesImplementation = (
    args: ParsedArgsDataType,
    dotenvProcessor: DotenvProcessor,
    dotenvOutputFileName: string
) => {
    if (args._.includes("test")) {
        const feedback: Feedback = dotenvProcessor.test();
        return feedback;
    }

    let backupFilePath = undefined;
    if (args.backup) {
        backupFilePath = dotenvProcessor.createBackupFile(args.backupFolder); // create backup. Do this first.
    }

    const isEncryption = ["enc"].includes(args._[0]);
    const feedback: Feedback = isEncryption
        ? dotenvProcessor.encryptToFile(dotenvOutputFileName)
        : dotenvProcessor.decryptToFile(dotenvOutputFileName);

    // Now that we have the feedback object, add any messages
    feedback.backupFileName = backupFilePath;

    return coerceFeedbackPathsToRelativePaths(feedback);
};

const processDotenvFiles = (
    envPath: string,
    args: ParsedArgsDataType,
    cryptoKeyManager: CryptoKeyManager,
    forceIvToFixedValue: boolean
): Feedback => {
    // Process dotenv files
    // Resolve the output and backup file paths
    const dotenvOutputFileName = args.output ? replaceFilePath(envPath, args.output) : envPath;

    // Process each file
    const dotenvProcessor = new DotenvProcessor(cryptoKeyManager, envPath, forceIvToFixedValue);
    let feedback: Feedback = processDotenvFilesImplementation(
        args,
        dotenvProcessor,
        dotenvOutputFileName
    );

    // Where was the file written to
    feedback.dotenvOutputFileName = dotenvOutputFileName;

    return coerceFeedbackPathsToRelativePaths(feedback);
};

export const mainImplementation = (
    args: ParsedArgsDataType,
    forceIvToFixedValue: boolean
): void => {
    const cryptoKeyManager = new CryptoKeyManager();
    // Load the keys from the environment. Could be loaded from a dotenv file.
    cryptoKeyManager.loadFromEnv();

    // Encrypt/decrypt a command line param or a file
    if (_.intersection(["xenc", "xdec", "kenc", "kdec"], args._).length) {
        encryptDecryptCommandLine(args, cryptoKeyManager, forceIvToFixedValue);
    } else {
        const files = fileGlob(args.file);
        if (!files.length) {
            console.log("No files found");
            process.exitCode = 20;
            return;
        }

        // Feedback for all the files processed
        const feedbackAll: Feedback[] = [];
        files.forEach((envPath) => {
            const feedback = processDotenvFiles(
                envPath,
                args,
                cryptoKeyManager,
                forceIvToFixedValue
            );
            feedbackAll.push(sortObjectByKeys(feedback));
        });

        const feedbackJson = JSON.stringify(feedbackAll, null, "\t");
        // console.log(feedbackJson);
        fs.writeFileSync(args.jsonOutput, feedbackJson);
    }
};

// No need to call 'mainImplementation' when running unit tests. It is called
//  explicitly within the unit tests.
/* istanbul ignore next */
if (!process.env.JEST_WORKER_ID) {
    mainImplementation(parseArgs(process.argv.slice(2)), false);
}
