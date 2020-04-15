import path from "path";

export interface Feedback {
    /**
     * Populated with the file path if the dotenv file was backed up.
     */
    backupFileName?: string;

    /**
     * The encryption/decryption results will be written to this file.
     */
    dotenvOutputFileName: string;

    /**
     * Read dotenv variables from this file.
     */
    dotenvSourceFileName: string;

    errors: {
        /**
         * Any errors related to the ciphered variable name.
         */
        cipheredVariableErrors: string[];

        /**
         * Any errors related to the encryption keys. Including length, name, etc.
         */
        encryptionKeyErrors: string[];

        /**
         * List of all variables which could not be decrypted.
         */
        errorDecryptingVariables: string[];

        /**
         * List of all variables which could not be encrypted.
         */
        errorEncryptingVariables: string[];

        /**
         * If the ciphered and plain text variable both exist.
         * Decrypt the ciphered variable. Compare the values
         * of the plain text and decrypted value. If they do not match
         * report the error.
         * @see matchingPlainTextAndCipherValues
         */
        errorValuesDoNotMatch: string[];

        /**
         * Any errors related to the dotenv variable name or value portion format.
         */
        invalidVariableFormat: string[];

        /**
         * List of all unencrypted variables in the dotenv file. Unencrypted variables are considered
         * an error. Since the ".env" should not contain unencrypted data when being
         * checked into source control.
         */
        plainTextVariables: string[];

        /**
         * Any errors related to the unencrypted variable name.
         */
        plainTextVariableErrors: string[];
    };
    warnings: {
        /**
         * List of any missing encryption keys. This is considered a warning. It can be normal
         * for a developer to not be given the encryption keys to sensitive environments such as test and production.
         */
        missingEncryptionKeys: string[];
    };
    info: {
        /**
         * List of all the encrypted variables.
         */
        encryptedVariables: string[];

        /**
         * List of all the encryption keys found.
         */
        encryptionKeys: string[];

        /**
         * If the ciphered and plain text variable both exist.
         * Decrypt the ciphered variable. Compare the values
         * of the plain text and decrypted value. If they match
         * report them here.
         * @see errorValuesDoNotMatch
         */
        matchingPlainTextAndCipherValues: string[];

        /**
         * Miscellaneous notifications. Eg. a command line argument that is ignored.
         */
        miscellaneous: string[];

        /**
         * List of all variables successfully decrypted.
         */
        successfullyDecrypted: string[];

        /**
         * List of all variables successfully encrypted.
         */
        successfullyEncrypted: string[];
    };
}

export const createDefaultFeedback = (feedbackOverrides?: Feedback): Feedback => {
    const f: Feedback = {
        dotenvSourceFileName: "",
        dotenvOutputFileName: "",
        errors: {
            plainTextVariables: [],
            errorDecryptingVariables: [],
            errorEncryptingVariables: [],
            errorValuesDoNotMatch: [],
            encryptionKeyErrors: [],
            cipheredVariableErrors: [],
            plainTextVariableErrors: [],
            invalidVariableFormat: [],
        },
        warnings: {
            missingEncryptionKeys: [],
        },
        info: {
            encryptedVariables: [],
            encryptionKeys: [],
            successfullyEncrypted: [],
            successfullyDecrypted: [],
            matchingPlainTextAndCipherValues: [],
            miscellaneous: [],
        },
    };
    return {
        ...f,
        ...feedbackOverrides,
    };
};

export const coerceFeedbackPathsToRelativePaths = (feedback: Feedback): Feedback => {
    if (feedback.backupFileName) {
        feedback.backupFileName = path.relative("", feedback.backupFileName);
    }
    feedback.dotenvOutputFileName = path.relative("", feedback.dotenvOutputFileName);
    feedback.dotenvSourceFileName = path.relative("", feedback.dotenvSourceFileName);
    return feedback;
};
