import { DotenvVariable } from "./dotenv_variable";
import { CryptoKeyManager } from "./crypto_key_manager";
import crypto from "crypto";
import { JWK } from "jose";
import _ from "lodash";
import assert from "assert";
// import assert from "assert-plus";

/**
 * Status of an attempt to encrypt or decrypt a dotenv variable
 */
export enum StatusCryptoWrapperResult {
    /**
     * Operation successful
     */
    success = "success",

    /**
     * Encryption key could not be found
     */
    missingEncryptionKey = "missingEncryptionKey",

    /**
     * An exception occurred during the encryption or decryption
     */
    exception = "exception",

    /**
     * All the encryption keys were tried but none were successful.
     */
    wildcardNoKeysMatch = "wildcardNoKeysMatch",
}

/**
 * Convert an error to something human readable
 */
export const statusCryptoWrapperToText = (
    status: StatusCryptoWrapperResult,
    keyName: string,
    exception?: Error
): string => {
    switch (status) {
        case StatusCryptoWrapperResult.success:
            return "Success";
        case StatusCryptoWrapperResult.missingEncryptionKey:
            return `Encryption key not found [${keyName}]`;
        case StatusCryptoWrapperResult.wildcardNoKeysMatch:
            return `None of the encryption keys could decrypt [${keyName}]`;
        case StatusCryptoWrapperResult.exception:
            if (exception) {
                return `Exception: Variable: [${keyName}], Message: [${exception.message}]`;
            } else {
                throw "Expected the parameter [exception] to be defined.";
            }
        default:
            throw "Unhandled value for StatusCryptoWrapperResult";
    }
};

/**
 * Status of an attempt to encrypt or decrypt a dotenv variable
 */
export interface CryptoWrapperResult {
    status: StatusCryptoWrapperResult;

    /**
     * If the encryption or decryption was successful, then the result is stored in this property.
     */
    result?: string;

    /**
     * List of failure reasons
     */
    failureExplanation: string[];

    /**
     * If encrypting: This contains the name of the unencrypted variable
     * If decrypting: This contains the name of the ciphered variable
     */
    oldDotenvVariableName: string;

    /**
     * If encrypting: This contains the name of the ciphered variable
     * If decrypting: This contains the name of the unencrypted variable
     */
    newDotenvVariableName: string;
}

/**
 * Interface for encryption decryption
 */
export interface CryptoWrapperInterface {
    /**
     * Encryption decryption algorithm name
     */
    algo(): string;

    /**
     * @see CryptoWrapperResult.newDotenvVariableName
     */
    newDotEnvVariableName(dv: DotenvVariable): string;

    encryptWithKeyManager(plainText: DotenvVariable[]): CryptoWrapperResult[];
    decryptWithKeyManager(cipherText: DotenvVariable[]): CryptoWrapperResult[];

    encrypt(plainText: DotenvVariable, key: JWK.Key): CryptoWrapperResult;
    decrypt(cipherText: DotenvVariable, key: JWK.Key): CryptoWrapperResult;
}

export class CryptoWrapperAes256Gcm implements CryptoWrapperInterface {
    // GCM mode generates a TAG at the end of the encryption and is needed when decrypting.
    // The TAG serves as a type of signature to ensure the ciphered text has not been altered.
    static readonly SYM_ENC_ALGO = "aes-256-gcm";
    static readonly SYM_ENC_KEY_LENGTH = 32; // 256 bits
    static readonly SYM_ENC_IV_LENGTH = 12; // 96 bits
    static readonly SYM_ENC_TAG_LENGTH = 16; // 128 bits

    /**
     * Used exclusively for testing to force the IV to be the same value, so encrypted
     * always match the expected value. If TRUE, this weakens the strength of the encryption.
     */
    private forceIvToFixedValue: boolean = false;

    cryptoMgr: CryptoKeyManager;

    constructor(cryptoMgr: CryptoKeyManager, forceIvToFixedValue: boolean = false) {
        this.cryptoMgr = cryptoMgr;
        this.forceIvToFixedValue = forceIvToFixedValue;
    }

    algo() {
        return CryptoWrapperAes256Gcm.SYM_ENC_ALGO;
    }

    newDotEnvVariableName(dv: DotenvVariable): string {
        if (dv.leftPattern() === "UNENCRYPTED") {
            return `CIPHERED${dv.separatorLeft}${dv.leftCryptoKeyName()}${
                dv.separatorLeft
            }${dv.leftVariableName()}`;
        } else if (dv.leftPattern() === "CIPHERED") {
            return `UNENCRYPTED${dv.separatorLeft}${dv.leftCryptoKeyName()}${
                dv.separatorLeft
            }${dv.leftVariableName()}`;
        } else {
            throw "Unhandled case";
        }
    }

    encryptWithKeyManager(dotenvPlainTextVariables: DotenvVariable[]): CryptoWrapperResult[] {
        const resultArray: CryptoWrapperResult[] = [];

        for (let i = 0; i < dotenvPlainTextVariables.length; i++) {
            const p = dotenvPlainTextVariables[i];
            const keyName = p.leftCryptoKeyName();

            assert.equal(p.isValid, true);

            const key = this.cryptoMgr.get(keyName);
            if (key) {
                const res = this.encrypt(p, key);
                resultArray.push(res);
            } else {
                resultArray.push({
                    status: StatusCryptoWrapperResult.missingEncryptionKey,
                    oldDotenvVariableName: p.leftSide,
                    newDotenvVariableName: this.newDotEnvVariableName(p),
                    failureExplanation: [
                        statusCryptoWrapperToText(
                            StatusCryptoWrapperResult.missingEncryptionKey,
                            this.cryptoMgr.buildDotenvNameFromKeyName(keyName)
                        ),
                    ],
                });
            }
        }

        return resultArray;
    }

    decryptWithKeyManager(dotenvCipherVariables: DotenvVariable[]): CryptoWrapperResult[] {
        const resultArray: CryptoWrapperResult[] = [];

        dotenvCipherVariables.forEach(cipher => {
            const requestedKeyName = cipher.leftCryptoKeyName();
            const failureExplanation: string[] = [];

            if (requestedKeyName === "WILDCARD") {
                // attempt to use all the keys
                const keyNames: string[] = this.cryptoMgr.allKeys();
                let keyFound = false;
                for (let i = 0; i < keyNames.length; i++) {
                    const key = this.cryptoMgr.get(keyNames[i]);
                    const res = this.decrypt(cipher, key);
                    if (res.status === StatusCryptoWrapperResult.success) {
                        resultArray.push(res);
                        keyFound = true;
                        break;
                    } else {
                        failureExplanation.push(...res.failureExplanation);
                    }
                }
                if (!keyFound) {
                    resultArray.push({
                        status: StatusCryptoWrapperResult.wildcardNoKeysMatch,
                        oldDotenvVariableName: cipher.leftSide,
                        newDotenvVariableName: this.newDotEnvVariableName(cipher),
                        failureExplanation: [
                            statusCryptoWrapperToText(
                                StatusCryptoWrapperResult.wildcardNoKeysMatch,
                                cipher.leftSide
                            ),
                            ..._.uniq(failureExplanation),
                        ],
                        result: undefined,
                    });
                }
            } else {
                const key = this.cryptoMgr.get(requestedKeyName);
                if (key) {
                    const res = this.decrypt(cipher, key);
                    resultArray.push(res);
                } else {
                    resultArray.push({
                        status: StatusCryptoWrapperResult.missingEncryptionKey,
                        oldDotenvVariableName: cipher.leftSide,
                        newDotenvVariableName: this.newDotEnvVariableName(cipher),
                        failureExplanation: [
                            statusCryptoWrapperToText(
                                StatusCryptoWrapperResult.missingEncryptionKey,
                                requestedKeyName
                            ),
                        ],
                    });
                }
            }
        });

        return resultArray;
    }

    encrypt(plainText: DotenvVariable, key: JWK.Key): CryptoWrapperResult {
        try {
            const IV = this.forceIvToFixedValue
                ? Buffer.alloc(CryptoWrapperAes256Gcm.SYM_ENC_IV_LENGTH)
                : crypto.randomBytes(CryptoWrapperAes256Gcm.SYM_ENC_IV_LENGTH);
            const cipher = crypto.createCipheriv(
                CryptoWrapperAes256Gcm.SYM_ENC_ALGO,
                key.keyObject,
                IV,
                {
                    authTagLength: CryptoWrapperAes256Gcm.SYM_ENC_TAG_LENGTH,
                }
            );
            const cipherBuffer = cipher.update(plainText.rightSide);
            const cipherText = Buffer.concat([cipherBuffer, cipher.final()]).toString("base64");

            return {
                status: StatusCryptoWrapperResult.success,
                oldDotenvVariableName: plainText.leftSide,
                newDotenvVariableName: this.newDotEnvVariableName(plainText),
                failureExplanation: [],
                result: `${IV.toString("base64")}.${cipherText}.${cipher
                    .getAuthTag()
                    .toString("base64")}`,
            };
        } catch (e) {
            const res: CryptoWrapperResult = {
                status: StatusCryptoWrapperResult.exception,
                oldDotenvVariableName: plainText.leftSide,
                newDotenvVariableName: this.newDotEnvVariableName(plainText),
                failureExplanation: [
                    statusCryptoWrapperToText(
                        StatusCryptoWrapperResult.exception,
                        plainText.leftSide,
                        e
                    ),
                ],
                result: undefined,
            };
            return res;
        }
    }

    decrypt(cipherText: DotenvVariable, key: JWK.Key): CryptoWrapperResult {
        try {
            const decipher = crypto.createDecipheriv(
                CryptoWrapperAes256Gcm.SYM_ENC_ALGO,
                key.keyObject,
                Buffer.from(cipherText.rightIV(), "base64"),
                {}
            );

            decipher.setAuthTag(Buffer.from(cipherText.rightSignature(), "base64"));
            let decrypted = decipher.update(Buffer.from(cipherText.rightCipheredText(), "base64"));
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return {
                status: StatusCryptoWrapperResult.success,
                oldDotenvVariableName: cipherText.leftSide,
                newDotenvVariableName: this.newDotEnvVariableName(cipherText),
                failureExplanation: [],
                result: decrypted.toString("ascii"),
            };
        } catch (e) {
            const res: CryptoWrapperResult = {
                status: StatusCryptoWrapperResult.exception,
                oldDotenvVariableName: cipherText.leftSide,
                newDotenvVariableName: this.newDotEnvVariableName(cipherText),
                failureExplanation: [
                    statusCryptoWrapperToText(
                        StatusCryptoWrapperResult.exception,
                        cipherText.leftSide,
                        e
                    ),
                ],
                result: undefined,
            };
            return res;
        }
    }
}
