import _ from "lodash";
import { CryptoWrapperResult } from "./crypto_wrapper";

export enum LeftSideTokenIds {
    cryptoKeyName = "cryptoKeyName",
    pattern = "pattern",
    variableName = "variableName",
}

export enum RightSideTokenIds {
    iv = "iv",
    cipher = "cipher",
    tag = "tag",
}

type LeftSideTokenDict = Map<LeftSideTokenIds, string>;
type RightSideTokenDict = Map<RightSideTokenIds, string>;

export class DotenvVariable {
    /**
     * Use the term 'leftSide' to avoid confusion with the term 'encryption key'.
     * 'leftSide' refers to the KEY portion of the KEY=VALUE pair.
     */
    leftSide: string;

    /**
     * Use the term 'rightSide' to avoid confusion with the term 'encryption key'.
     * 'rightSide' refers to the VALUE portion of the KEY=VALUE pair.
     */
    rightSide: string;

    separatorLeft: string;
    separatorRight: string;

    leftSideTokens: LeftSideTokenDict = new Map<LeftSideTokenIds, string>();
    rightSideTokens: RightSideTokenDict = new Map<RightSideTokenIds, string>();

    /**
     * If they name of the key is a reserved word, store the reserved word here.
     */
    usingReservedWord?: string;

    errors: string[] = [];

    /**
     * Is the dotenv variable valid?
     * The variable is not considered valid if the key name is a reserved word.
     */
    isValid: boolean = true;

    constructor(
        leftSide: string,
        rightSide: string,
        separatorLeft: string,
        separatorRight: string
    ) {
        this.leftSide = leftSide;
        this.rightSide = rightSide;
        this.separatorLeft = separatorLeft;
        this.separatorRight = separatorRight;
    }

    leftCryptoKeyName(): string {
        const s = this.leftSideTokens.get(LeftSideTokenIds.cryptoKeyName);
        if (!s) {
            throw "leftCryptoKeyName: Value not found";
        }
        return s;
    }

    leftPattern(): string {
        const s = this.leftSideTokens.get(LeftSideTokenIds.pattern);
        if (!s) {
            throw "leftPattern: Value not found";
        }
        return s;
    }

    leftVariableName(): string {
        const s = this.leftSideTokens.get(LeftSideTokenIds.variableName);
        if (!s) {
            throw "leftVariableName: Value not found";
        }
        return s;
    }

    rightIV(): string {
        const s = this.rightSideTokens.get(RightSideTokenIds.iv);
        if (!s) {
            throw "rightIV: Value not found";
        }
        return s;
    }

    rightCipheredText(): string {
        const s = this.rightSideTokens.get(RightSideTokenIds.cipher);
        if (!s) {
            throw "rightCipheredText: Value not found";
        }
        return s;
    }

    rightSignature(): string {
        const s = this.rightSideTokens.get(RightSideTokenIds.tag);
        if (!s) {
            throw "rightSignature: Value not found";
        }
        return s;
    }

    static isEqualCryptoKeyNameSeparatoVariableName(x: DotenvVariable, y: DotenvVariable): boolean {
        return (
            x.leftCryptoKeyName() === y.leftCryptoKeyName() &&
            x.separatorLeft === y.separatorLeft &&
            x.leftVariableName() === y.leftVariableName()
        );
    }
}

/**
 * Struct for storing two matching dotenv variables.
 * The ciphered value must be decrypted first. The two unencrypted values can then be compared.
 * The encryption always generates a new value even when using the same text. This prevents
 * the ciphered values from being compared.
 */
export interface MatchingDotenvVariable {
    plainText: DotenvVariable;
    ciphered: DotenvVariable;
    plainTextEncryptionResult?: CryptoWrapperResult;
    cipheredDecryptionResult: CryptoWrapperResult;
}

export const isEqualMatchingDotenvVariable = (
    a: MatchingDotenvVariable,
    b: MatchingDotenvVariable
): boolean => {
    return (
        a.plainText.leftSide === b.plainText.leftSide && a.ciphered.leftSide === b.ciphered.leftSide
    );
};

// export const isEqualMatchingDotenvVariableLeftRight = (
//     a: MatchingDotenvVariable,
//     b: MatchingDotenvVariable
// ): boolean => {
//     return (
//         a.plainText.leftSide === b.plainText.leftSide &&
//         a.ciphered.leftSide === b.ciphered.leftSide &&
//         a.plainText.rightSide === b.plainText.rightSide &&
//         _.isEqual(a.cipheredDecryptionResult?.result, b.cipheredDecryptionResult?.result)
//     );
// };
