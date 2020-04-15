import * as feedback from "../src/feedback";

const emptyFeedback: feedback.Feedback = {
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
    warnings: { missingEncryptionKeys: [] },
    info: {
        encryptedVariables: [],
        encryptionKeys: [],
        successfullyEncrypted: [],
        successfullyDecrypted: [],
        matchingPlainTextAndCipherValues: [],
        miscellaneous: [],
    },
};

const nonemptyFeedback: feedback.Feedback = {
    dotenvSourceFileName: "dotenvSourceFileName",
    dotenvOutputFileName: "dotenvOutputFileName",
    backupFileName: "backupFileName",
    errors: {
        plainTextVariables: ["plainTextVariables"],
        errorDecryptingVariables: ["errorDecryptingVariables"],
        errorEncryptingVariables: ["errorEncryptingVariables"],
        errorValuesDoNotMatch: ["errorValuesDoNotMatch"],
        encryptionKeyErrors: ["encryptionKeyErrors"],
        cipheredVariableErrors: ["cipheredVariableErrors"],
        plainTextVariableErrors: ["plainTextVariableErrors"],
        invalidVariableFormat: ["invalidVariableFormat"],
    },
    warnings: { missingEncryptionKeys: ["missingEncryptionKeys"] },
    info: {
        encryptedVariables: ["encryptedVariables"],
        encryptionKeys: ["encryptionKeys"],
        successfullyEncrypted: ["successfullyEncrypted"],
        successfullyDecrypted: ["successfullyDecrypted"],
        matchingPlainTextAndCipherValues: ["matchingPlainTextAndCipherValues"],
        miscellaneous: ["miscellaneous"],
    },
};

describe("Test Feedback", () => {
    it("createDefaultFeedback", () => {
        expect(feedback.createDefaultFeedback()).toEqual(emptyFeedback);
        expect(feedback.createDefaultFeedback(nonemptyFeedback)).toEqual(nonemptyFeedback);
    });
});
