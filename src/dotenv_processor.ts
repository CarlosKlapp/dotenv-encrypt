import * as reservedWords from "./reserved_words";
import _ from "lodash";
import dotenv from "dotenv";
import fs from "fs";
import { createDefaultFeedback, Feedback, coerceFeedbackPathsToRelativePaths } from "./feedback";
import { CryptoKeyManager } from "./crypto_key_manager";
import { MatchingDotenvVariable, isEqualMatchingDotenvVariable } from "./dotenv_variable";
import {
    CryptoWrapperAes256Gcm,
    CryptoWrapperResult,
    StatusCryptoWrapperResult,
    CryptoWrapperInterface,
} from "./crypto_wrapper";
import {
    DotenvParserPlainTextVariable,
    DotenvParserCipheredVariable,
    DotenvParserBase,
} from "./dotenv_parser";
import { sortObjectByKeys, createBackupFilePath } from "./util";
import * as assert from "assert";

/**
 * This class read/writes/encrypts/decrypts the a dotenv file.
 * It can also test a dotenv file for errors.
 */
export class DotenvProcessor {
    plainTextParser: DotenvParserBase;
    cipheredTextParser: DotenvParserBase;

    matchingDotenvVariables: MatchingDotenvVariable[] = [];
    nonMatchingDotenvVariables: MatchingDotenvVariable[] = [];

    dotenvPath?: string;
    dotenvAsBuffer?: Buffer;
    cryptoKeyMgr: CryptoKeyManager;
    cryptoWrapper: CryptoWrapperInterface;

    /**
     * Used exclusively for testing to force the IV to be the same value, so encrypted
     * always match the expected value. If TRUE, this weakens the strength of the encryption.
     */
    private forceIvToFixedValue: boolean = false;

    constructor(
        ckm: CryptoKeyManager,
        pathOrBuffer?: string | Buffer,
        forceIvToFixedValue: boolean = false
    ) {
        this.forceIvToFixedValue = forceIvToFixedValue;

        this.cryptoKeyMgr = ckm;
        this.cryptoWrapper = new CryptoWrapperAes256Gcm(ckm, this.forceIvToFixedValue);

        this.plainTextParser = new DotenvParserPlainTextVariable();
        this.cipheredTextParser = new DotenvParserCipheredVariable();

        if (pathOrBuffer) {
            if (typeof pathOrBuffer === "string") {
                this.dotenvPath = pathOrBuffer;
                this.dotenvAsBuffer = fs.readFileSync(pathOrBuffer);
            } else {
                this.dotenvAsBuffer = pathOrBuffer;
            }
            const env = dotenv.parse(this.dotenvAsBuffer);
            this.plainTextParser.parseObject(env);
            this.cipheredTextParser.parseObject(env);
        } else {
            this.cipheredTextParser.parseObject(process.env);
        }
    }

    defaultBackupPath(): string {
        if (_.isEmpty(this.dotenvPath)) {
            return "no_file_name_specified.bak";
        } else {
            return `${this.dotenvPath}.bak`;
        }
    }

    createFileNameForBackupFile(backupFolder?: string): string {
        let fileName;
        if (backupFolder) {
            if (this.dotenvPath && !_.isEmpty(this.dotenvPath)) {
                fileName = createBackupFilePath(this.dotenvPath, backupFolder);
            } else {
                fileName = createBackupFilePath("", backupFolder);
            }
        } else {
            fileName = this.defaultBackupPath();
        }
        return fileName;
    }

    createBackupFile(backupFolder?: string): string {
        const fileName = this.createFileNameForBackupFile(backupFolder);

        assert.ok(this.dotenvAsBuffer);
        fs.writeFileSync(fileName, this.dotenvAsBuffer);
        return fileName;
    }

    private determineMatchingCipheredAndPlainTextVariables(
        decryptResults: CryptoWrapperResult[],
        encryptResults?: CryptoWrapperResult[]
    ): void {
        decryptResults
            .filter((x) => x.status === StatusCryptoWrapperResult.success)
            .forEach((y) => {
                const ciphered = this.cipheredTextParser.variables.find(
                    (z) => z.leftSide === y.oldDotenvVariableName
                );
                // find the plain text variable
                const plainText = this.plainTextParser.variables.find(
                    (z) => z.leftSide === y.newDotenvVariableName
                );

                if (ciphered && plainText) {
                    // Both the ciphered text and the plain text exist
                    let plainTextEncryptionResult = encryptResults?.find(
                        (z) =>
                            z.status === StatusCryptoWrapperResult.success &&
                            z.oldDotenvVariableName === plainText.leftSide
                    );
                    if (y.result === plainText.rightSide) {
                        this.matchingDotenvVariables.push({
                            plainText,
                            ciphered,
                            plainTextEncryptionResult: plainTextEncryptionResult,
                            cipheredDecryptionResult: y,
                        });
                    } else {
                        this.nonMatchingDotenvVariables.push({
                            plainText,
                            ciphered,
                            plainTextEncryptionResult: plainTextEncryptionResult,
                            cipheredDecryptionResult: y,
                        });
                    }
                }
            });
        this.matchingDotenvVariables = _.uniqWith(
            this.matchingDotenvVariables,
            isEqualMatchingDotenvVariable
        );
        this.nonMatchingDotenvVariables = _.uniqWith(
            this.nonMatchingDotenvVariables,
            isEqualMatchingDotenvVariable
        );
    }

    private feedbackPlainTextVariables(encryptResults?: CryptoWrapperResult[]): string[] {
        if (encryptResults) {
            return _.uniq(
                _.difference(
                    this.plainTextParser.variables.map((x) => x.leftSide),
                    encryptResults.map((x) => x.oldDotenvVariableName)
                )
            ).sort();
        } else {
            return [];
        }
    }

    private feedbackErrorDecryptingVariables(decryptResults: CryptoWrapperResult[]): string[] {
        const failureExplanation: string[] = [];
        decryptResults
            .filter((x) => x.status !== StatusCryptoWrapperResult.success)
            .forEach((y) => failureExplanation.push(...y.failureExplanation));
        return _.uniq(failureExplanation).sort();
    }

    private feedbackErrorEncryptingVariables(encryptResults: CryptoWrapperResult[]): string[] {
        const failureExplanation: string[] = [];
        encryptResults
            .filter((x) => x.status !== StatusCryptoWrapperResult.success)
            .forEach((y) => failureExplanation.push(...y.failureExplanation));
        return _.uniq(failureExplanation).sort();
    }

    private feedbackErrorValuesDoNotMatch(): string[] {
        return this.nonMatchingDotenvVariables
            .map(
                (x) =>
                    `Mismatch between [${x.plainText.leftSide}] and [${x.ciphered.leftSide}]. [${x.plainText.rightSide}]!=[${x.cipheredDecryptionResult.result}]`
            )
            .sort();
    }

    private feedbackInfoMatchingValues(): string[] {
        return this.matchingDotenvVariables
            .map((x) => `Match between [${x.plainText.leftSide}] and [${x.ciphered.leftSide}]`)
            .sort();
    }

    private feedbackSuccessfullyDecrypted(decryptResults: CryptoWrapperResult[]): string[] {
        return _.uniq(
            decryptResults
                .filter((x) => x.status === StatusCryptoWrapperResult.success)
                .map((y) => y.oldDotenvVariableName)
        ).sort();
    }

    private feedbackSuccessfullyEncrypted(encryptResults: CryptoWrapperResult[]): string[] {
        return _.uniq(
            encryptResults
                .filter((x) => x.status === StatusCryptoWrapperResult.success)
                .map((y) => y.oldDotenvVariableName)
        ).sort();
    }

    private feedbackEncryptionKeyErrors(): string[] {
        return this.cryptoKeyMgr.errors();
    }

    private feedbackCipheredVariableErrors(): string[] {
        return _.flatten(this.cipheredTextParser.variableInvalid.map((x) => x.errors));
    }

    private feedbackPlainTextVariableErrors(): string[] {
        return _.flatten(this.plainTextParser.variableInvalid.map((x) => x.errors));
    }

    private feedbackMissingEncryptionKeys(): string[] {
        const missing = _.uniq(
            _.difference(
                _.concat(
                    this.plainTextParser.variables.map((x) => x.leftCryptoKeyName()),
                    this.cipheredTextParser.variables.map((y) => y.leftCryptoKeyName())
                ),
                _.concat(
                    this.cryptoKeyMgr.all().map((z) => z.kid),
                    reservedWords.keyNames
                )
            )
        ).sort();
        return missing.map((x) => this.cryptoKeyMgr.buildDotenvNameFromKeyName(x));
    }

    private feedbackCipheredVariables(): string[] {
        return this.cipheredTextParser.variables.map((y) => y.leftSide).sort();
    }

    private feedbackEncryptionKeys(): string[] {
        return this.cryptoKeyMgr.parser.variables.map((x) => x.leftSide).sort();
    }

    private feedbackInvalidVariableFormats(): string[] {
        // Rewrite the code so test coverage is correctly reported. <groan>
        // const p = this.plainTextParser.variableInvalid.map(x => x.leftSide);
        // const c = this.cipheredTextParser.variableInvalid.map(y => y.leftSide);
        // return _.uniq(p.concat(c)).sort();

        return _.uniq(
            _.concat(
                this.plainTextParser.variableInvalid.map((x) => x.leftSide),
                this.cipheredTextParser.variableInvalid.map((y) => y.leftSide)
            )
        ).sort();
    }

    private testImplementation(
        decryptResults: CryptoWrapperResult[],
        encryptResults?: CryptoWrapperResult[]
    ): Feedback {
        assert.ok(!_.isEmpty(this.dotenvPath));
        const feedback: Feedback = { ...createDefaultFeedback() };

        // this.dotenvPath cannot be null in this code path. Force to a string.
        feedback.dotenvSourceFileName = this.dotenvPath as string;

        this.determineMatchingCipheredAndPlainTextVariables(decryptResults, encryptResults);

        //-----------------------------------------------
        feedback.errors.errorDecryptingVariables = this.feedbackErrorDecryptingVariables(
            decryptResults
        );
        feedback.errors.cipheredVariableErrors = this.feedbackCipheredVariableErrors();
        feedback.errors.encryptionKeyErrors = this.feedbackEncryptionKeyErrors();
        feedback.errors.errorValuesDoNotMatch = this.feedbackErrorValuesDoNotMatch();
        feedback.errors.invalidVariableFormat = this.feedbackInvalidVariableFormats();
        feedback.errors.plainTextVariableErrors = this.feedbackPlainTextVariableErrors();
        feedback.errors.plainTextVariables = this.feedbackPlainTextVariables(encryptResults);
        feedback.info.encryptedVariables = this.feedbackCipheredVariables();
        feedback.info.encryptionKeys = this.feedbackEncryptionKeys();
        feedback.info.matchingPlainTextAndCipherValues = this.feedbackInfoMatchingValues();
        feedback.warnings.missingEncryptionKeys = this.feedbackMissingEncryptionKeys();
        if (encryptResults) {
            feedback.errors.errorEncryptingVariables = this.feedbackErrorEncryptingVariables(
                encryptResults
            );
            feedback.info.successfullyDecrypted = this.feedbackSuccessfullyDecrypted(
                decryptResults
            );
            feedback.info.successfullyEncrypted = this.feedbackSuccessfullyEncrypted(
                encryptResults
            );
        }
        // Make the JSON object easier to read by sorting the properties by key name.
        const sortedFeedback = sortObjectByKeys(feedback);

        return sortedFeedback;
    }

    test(): Feedback {
        const decryptResults: CryptoWrapperResult[] = this.decrypt();
        const encryptResults: CryptoWrapperResult[] = this.encrypt();
        return coerceFeedbackPathsToRelativePaths(
            this.testImplementation(decryptResults, encryptResults)
        );
    }

    decrypt(): CryptoWrapperResult[] {
        const result = this.cryptoWrapper.decryptWithKeyManager(this.cipheredTextParser.variables);
        return result;
    }

    encrypt(): CryptoWrapperResult[] {
        const result = this.cryptoWrapper.encryptWithKeyManager(this.plainTextParser.variables);
        return result;
    }

    private decryptImplementation(): { feedback: Feedback; dotenvAsString: string } {
        assert.ok(this.dotenvAsBuffer);

        const decryptResults: CryptoWrapperResult[] = this.decrypt();

        const feedback = this.testImplementation(decryptResults, undefined);

        let dotenvAsString = (this.dotenvAsBuffer as Buffer).toString();

        //  Key: exists
        //  PlainText: exists
        //  Cipher: exists
        //  Cipher decryption: success
        //      compare values.
        //          If values match, remove cipher text
        //          If values DO NOT match, update the plain text and remove cipher text
        {
            this.matchingDotenvVariables.forEach((x) => {
                const pattern = `^\\s*?${x.ciphered.leftSide}\\s*?=.*?$`;
                const rex = new RegExp(pattern, "gm");
                dotenvAsString = dotenvAsString.replace(rex, "");
            });

            this.nonMatchingDotenvVariables.forEach((x) => {
                let pattern = `^\\s*?${x.plainText.leftSide}\\s*?=.*?$`;
                let rex = new RegExp(pattern, "gm");
                const replacement = `${x.plainText.leftSide}=${x.cipheredDecryptionResult.result}`;
                dotenvAsString = dotenvAsString.replace(rex, replacement);

                pattern = `^\\s*?${x.ciphered.leftSide}\\s*?=.*?$`;
                rex = new RegExp(pattern, "gm");
                dotenvAsString = dotenvAsString.replace(rex, "");
            });
        }

        //  Key: exists
        //  PlainText: missing
        //  Cipher: exists
        //  Cipher decryption: success
        //      replace cipher with plain text
        {
            decryptResults
                .filter((x) => x.status === StatusCryptoWrapperResult.success)
                .forEach((x) => {
                    const pattern = `^\\s*?${x.oldDotenvVariableName}\\s*?=.*?$`;
                    const rex = new RegExp(pattern, "gm");
                    const replacement = `${x.newDotenvVariableName}=${x.result}`;
                    dotenvAsString = dotenvAsString.replace(rex, replacement);
                });
        }

        return {
            feedback,
            dotenvAsString,
        };
    }

    decryptToProcessEnvironment(): Feedback {
        const decryptResult = this.decryptImplementation();
        const parsed = dotenv.parse(decryptResult.dotenvAsString);

        Object.keys(parsed).forEach(function (key) {
            // Overwrite env value. This behavior differs from dotenv.
            process.env[key] = parsed[key];
        });

        return coerceFeedbackPathsToRelativePaths(decryptResult.feedback);
    }

    decryptToFile(destinationFile: string): Feedback {
        const decryptResult = this.decryptImplementation();
        fs.writeFileSync(destinationFile, decryptResult.dotenvAsString);
        decryptResult.feedback.dotenvOutputFileName = destinationFile;
        return coerceFeedbackPathsToRelativePaths(decryptResult.feedback);
    }

    encryptToFile(destinationFile: string): Feedback {
        assert.ok(this.dotenvAsBuffer);

        const encryptResults: CryptoWrapperResult[] = this.encrypt();
        const decryptResults: CryptoWrapperResult[] = this.decrypt();

        const feedback = this.testImplementation(decryptResults, encryptResults);
        feedback.dotenvOutputFileName = destinationFile;

        let dotenvAsString = (this.dotenvAsBuffer as Buffer).toString();

        //  Key: exists
        //  PlainText: exists
        //  Plain text encryption: success
        //  Cipher: exists
        //  Cipher decryption: success
        //      compare values. If values match, remove plain text
        {
            this.matchingDotenvVariables.forEach((x) => {
                const pattern = `^\\s*?${x.plainText.leftSide}\\s*?=.*?$`;
                const rex = new RegExp(pattern, "gm");
                dotenvAsString = dotenvAsString.replace(rex, "");
            });
        }

        //  Key: exists
        //  PlainText: exists
        //  Plain text encryption: success
        //  Cipher: exists
        //  Cipher decryption: success
        //      compare values. If values DO NOT match, remove plain text
        //      update cipher value
        {
            this.nonMatchingDotenvVariables.forEach((x) => {
                let pattern = `^\\s*?${x.plainText.leftSide}\\s*?=.*?$`;
                let rex = new RegExp(pattern, "gm");
                dotenvAsString = dotenvAsString.replace(rex, "");
            });

            encryptResults
                .filter((x) => x.status === StatusCryptoWrapperResult.success)
                .forEach((y) => {
                    let pattern = `^\\s*?${y.newDotenvVariableName}\\s*?=.*?$`;
                    let rex = new RegExp(pattern, "gm");
                    const replacement = `${y.newDotenvVariableName}=${y.result}`;
                    dotenvAsString = dotenvAsString.replace(rex, replacement);
                });
        }

        //  Key: exists
        //  PlainText: exists
        //  Plain text encryption: success
        //  Cipher: missing
        //  Cipher decryption: n/a
        //      replace plain text with cipher
        {
            encryptResults
                .filter((x) => x.status === StatusCryptoWrapperResult.success)
                .forEach((y) => {
                    const pattern = `^\\s*?${y.oldDotenvVariableName}\\s*?=.*?$`;
                    const rex = new RegExp(pattern, "gm");
                    const replacementString = `${y.newDotenvVariableName}=${y.result}`;
                    dotenvAsString = dotenvAsString.replace(rex, replacementString);
                });
        }

        fs.writeFileSync(destinationFile, dotenvAsString);
        return coerceFeedbackPathsToRelativePaths(feedback);
    }
}
