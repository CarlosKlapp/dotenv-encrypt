import { DotenvVariable, LeftSideTokenIds, RightSideTokenIds } from "./dotenv_variable";
import _ from "lodash";
import * as reservedWords from "./reserved_words";

export interface DotenvParserOptions {
    /**
     * Separator used to tokenize the left side of the key value pair.
     */
    separatorLeft?: string;

    /**
     * Min number of tokens after parsing. Used to valid the format.
     */
    minTokensLeft?: number;

    /**
     * Max number of tokens after parsing. Used to valid the format.
     */
    maxTokensLeft?: number;

    /**
     * Separator used to tokenize the right side of the key value pair.
     */
    separatorRight?: string;

    /**
     * Min number of tokens after parsing. Used to valid the format.
     */
    minTokensRight?: number;
    /**
     * Max number of tokens after parsing. Used to valid the format.
     */
    maxTokensRight?: number;

    /**
     * Current only supports a prefix to find dotenv variables.
     * @example UNENCRYPTED__
     * @example CIPHERED__
     * @example DOTENV_ENC_KEY__
     */
    cryptoKeyNamePrefix?: string;
}

export interface TokenizeResult {
    isValid: boolean;
    tokens: string[];
}

/**
 * Base class for the parsing of the dotenv variables
 */
export abstract class DotenvParserBase {
    /**
     * All environment variables regardless of any errors
     */
    readonly variablesAll: DotenvVariable[] = [];

    /**
     * Environment variables erroneously using a reserved word for the crypto key name
     */
    readonly variablesUsingReservedWord: DotenvVariable[] = [];

    /**
     * List of invalid variables. Includes values using reserved words.
     */
    readonly variableInvalid: DotenvVariable[] = [];

    /**
     * Environment variables without any errors
     */
    readonly variables: DotenvVariable[] = [];

    // Parsing options
    readonly separatorLeft: string;
    readonly minTokensLeft: number;
    readonly maxTokensLeft: number;
    readonly separatorRight: string;
    readonly minTokensRight: number;
    readonly maxTokensRight: number;
    readonly cryptoKeyNamePrefix: string;

    constructor(options: DotenvParserOptions) {
        this.separatorLeft = options.separatorLeft ?? "__";
        this.minTokensLeft = options.minTokensLeft ?? 2;
        this.maxTokensLeft = options.maxTokensLeft ?? 2;
        this.separatorRight = options.separatorRight ?? ".";
        this.minTokensRight = options.minTokensRight ?? 3;
        this.maxTokensRight = options.maxTokensRight ?? 3;
        this.cryptoKeyNamePrefix = options.cryptoKeyNamePrefix ?? "DOTENV_ENC_KEY";
    }

    protected tokenizeLeftSide(leftSide: string): TokenizeResult | undefined {
        // Exclude empty strings
        const tokens = leftSide.split(this.separatorLeft).filter(t => !_.isEmpty(t));

        if (tokens[0] === this.cryptoKeyNamePrefix) {
            if (tokens.length < this.minTokensLeft) {
                return { isValid: false, tokens };
            }

            if (tokens.length > this.maxTokensLeft) {
                return { isValid: false, tokens };
            }

            return { isValid: true, tokens };
        } else {
            return undefined;
        }
    }

    protected tokenizeRightSide(rightSide: string): TokenizeResult {
        // Exclude empty strings
        const tokens = rightSide.split(this.separatorRight).filter(t => !_.isEmpty(t));

        if (tokens.length < this.minTokensRight) {
            return { isValid: false, tokens };
        }
        if (tokens.length > this.maxTokensRight) {
            return { isValid: false, tokens };
        }

        return { isValid: true, tokens };
    }

    protected abstract tokenize(leftSide: string, rightSide: string): DotenvVariable | undefined;

    parseObject(env: object): void {
        // Skip any pairs that do not have a value
        Object.entries(env).forEach(element => {
            if (element[0] && element[1]) {
                const m = this.tokenize(element[0], element[1]);
                if (m) {
                    this.variablesAll.push(m);
                    if (m.usingReservedWord) {
                        this.variablesUsingReservedWord.push(m);
                    }
                    if (m.isValid) {
                        this.variables.push(m);
                    } else {
                        this.variableInvalid.push(m);
                    }
                }
            }
        });
    }
}

export class DotenvParserCryptoKey extends DotenvParserBase {
    constructor() {
        super({
            minTokensLeft: 2,
            maxTokensLeft: 2,
            cryptoKeyNamePrefix: "DOTENV_ENC_KEY",
        });
    }

    protected tokenize(leftSide: string, rightSide: string): DotenvVariable | undefined {
        const leftTokens = this.tokenizeLeftSide(leftSide);

        if (!leftTokens) {
            return undefined;
        }

        const d = new DotenvVariable(leftSide, rightSide, this.separatorLeft, this.separatorRight);
        d.isValid = leftTokens.isValid;
        if (d.isValid) {
            d.leftSideTokens.set(LeftSideTokenIds.pattern, leftTokens.tokens[0]);
            d.leftSideTokens.set(LeftSideTokenIds.cryptoKeyName, leftTokens.tokens[1]);

            if (reservedWords.keyNames.includes(d.leftCryptoKeyName())) {
                d.usingReservedWord = d.leftCryptoKeyName();
                d.isValid = false;
                d.errors.push(
                    `The encryption key name [${leftSide}] is the reserved word [${d.usingReservedWord}].`
                );
            }
        } else {
            d.errors.push(
                `The encryption key name is invalid [${leftSide}] or the value is invalid [${rightSide}].`
            );
        }
        d.errors = _.uniq(d.errors).sort();
        return d;
    }
}

export class DotenvParserPlainTextVariable extends DotenvParserBase {
    constructor() {
        super({
            minTokensLeft: 3,
            maxTokensLeft: 3,
            cryptoKeyNamePrefix: "UNENCRYPTED",
        });
    }

    tokenize(leftSide: string, rightSide: string): DotenvVariable | undefined {
        const leftTokens = this.tokenizeLeftSide(leftSide);

        if (!leftTokens) {
            return undefined;
        }

        const d = new DotenvVariable(leftSide, rightSide, this.separatorLeft, this.separatorRight);
        d.isValid = leftTokens.isValid;
        if (d.isValid) {
            d.leftSideTokens.set(LeftSideTokenIds.pattern, leftTokens.tokens[0]);
            d.leftSideTokens.set(LeftSideTokenIds.cryptoKeyName, leftTokens.tokens[1]);
            d.leftSideTokens.set(LeftSideTokenIds.variableName, leftTokens.tokens[2]);

            if (reservedWords.keyNamesForPlainTextVariable.includes(d.leftCryptoKeyName())) {
                d.usingReservedWord = d.leftCryptoKeyName();
                d.isValid = false;
                d.errors.push(
                    `The encryption key name [${leftSide}] is the reserved word [${d.usingReservedWord}].`
                );
            }
            return d;
        } else {
            d.errors.push(
                `The encryption key name is invalid [${leftSide}] or the value is invalid [${rightSide}].`
            );
        }
        d.errors = _.uniq(d.errors).sort();
        return d;
    }
}

export class DotenvParserCipheredVariable extends DotenvParserBase {
    constructor() {
        super({
            minTokensLeft: 3,
            maxTokensLeft: 3,
            cryptoKeyNamePrefix: "CIPHERED",
        });
    }

    tokenize(leftSide: string, rightSide: string): DotenvVariable | undefined {
        const leftTokens = this.tokenizeLeftSide(leftSide);
        const rightTokens = this.tokenizeRightSide(rightSide);

        if (!leftTokens) {
            return undefined;
        }

        const d = new DotenvVariable(leftSide, rightSide, this.separatorLeft, this.separatorRight);
        d.isValid = leftTokens.isValid && rightTokens.isValid;
        if (d.isValid) {
            d.leftSideTokens.set(LeftSideTokenIds.pattern, leftTokens.tokens[0]);
            d.leftSideTokens.set(LeftSideTokenIds.cryptoKeyName, leftTokens.tokens[1]);
            d.leftSideTokens.set(LeftSideTokenIds.variableName, leftTokens.tokens[2]);

            if (reservedWords.keyNamesForCipheredVariable.includes(d.leftCryptoKeyName())) {
                d.usingReservedWord = d.leftCryptoKeyName();
                d.isValid = false;
                d.errors.push(
                    `The encryption key name [${leftSide}] is the reserved word [${d.usingReservedWord}].`
                );
            }
            d.rightSideTokens.set(RightSideTokenIds.iv, rightTokens.tokens[0]);
            d.rightSideTokens.set(RightSideTokenIds.cipher, rightTokens.tokens[1]);
            d.rightSideTokens.set(RightSideTokenIds.tag, rightTokens.tokens[2]);
        } else {
            d.errors.push(
                `The encryption key name is invalid [${leftSide}] or the value is invalid [${rightSide}].`
            );
            if (
                !(
                    this.minTokensLeft <= leftTokens.tokens.length &&
                    leftTokens.tokens.length <= this.maxTokensLeft
                )
            ) {
                d.errors.push(
                    `[${leftSide}] Got ${leftTokens.tokens.length} tokens on the left side. Expected between ${this.minTokensLeft} and ${this.maxTokensLeft}`
                );
            }
            if (
                !(
                    this.minTokensRight <= rightTokens.tokens.length &&
                    rightTokens.tokens.length <= this.maxTokensRight
                )
            ) {
                d.errors.push(
                    `[${leftSide}] Got ${rightTokens.tokens.length} tokens on the right side. Expected between ${this.minTokensRight} and ${this.maxTokensRight}`
                );
            }
        }
        return d;
    }
}

export class DotenvParserTestConstructor extends DotenvParserBase {
    constructor(options: DotenvParserOptions) {
        super(options);
    }

    tokenize(_leftSide: string, _rightSide: string): DotenvVariable | undefined {
        return undefined;
    }
}
