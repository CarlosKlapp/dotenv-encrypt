import "jest-extended";
import * as CKM from "../src/crypto_key_manager";
import * as CW from "../src/crypto_wrapper";
import * as DP from "../src/dotenv_parser";
import * as DV from "../src/dotenv_variable";
import { JWK } from "jose";

const keys = {
    DOTENV_ENC_KEY__UNIT_TEST_ALL: "IEs6KmY5awWIi62UTwVsozl2dFDZUuReVpPLQ/8WCzU=",
};

describe("Test crypto_wrapper: statusCryptoWrapperToText", () => {
    it("statusCryptoWrapperToText", () => {
        expect(
            CW.statusCryptoWrapperToText(CW.StatusCryptoWrapperResult.success, "TEST_KEY_NAME")
        ).toEqual("Success");

        expect(
            CW.statusCryptoWrapperToText(
                CW.StatusCryptoWrapperResult.missingEncryptionKey,
                "TEST_KEY_NAME"
            )
        ).toEqual("Encryption key not found [TEST_KEY_NAME]");

        expect(
            CW.statusCryptoWrapperToText(
                CW.StatusCryptoWrapperResult.wildcardNoKeysMatch,
                "TEST_KEY_NAME"
            )
        ).toEqual("None of the encryption keys could decrypt [TEST_KEY_NAME]");

        expect(
            CW.statusCryptoWrapperToText(
                CW.StatusCryptoWrapperResult.exception,
                "TEST_KEY_NAME",
                new Error("Test error")
            )
        ).toEqual("Exception: Variable: [TEST_KEY_NAME], Message: [Test error]");

        expect(() =>
            CW.statusCryptoWrapperToText(CW.StatusCryptoWrapperResult.exception, "TEST_KEY_NAME")
        ).toThrow();

        expect(() => {
            CW.statusCryptoWrapperToText(
                "not found" as CW.StatusCryptoWrapperResult,
                "TEST_KEY_NAME"
            );
        }).toThrow();
    });
});

describe("Test crypto_wrapper: CryptoWrapperAes256Gcm", () => {
    const ckm = new CKM.CryptoKeyManager();
    ckm.loadFromObject(keys);
    const cw = new CW.CryptoWrapperAes256Gcm(ckm);
    const unencrypted = new DP.DotenvParserPlainTextVariable();
    unencrypted.parseObject({
        UNENCRYPTED__LOCAL__MISSING: "missing key",
        UNENCRYPTED__UNIT_TEST_ALL__TEXT: "text",
    });
    const unencryptedResult: CW.CryptoWrapperResult[] = [
        {
            status: CW.StatusCryptoWrapperResult.missingEncryptionKey,
            oldDotenvVariableName: "UNENCRYPTED__LOCAL__MISSING",
            newDotenvVariableName: "CIPHERED__LOCAL__MISSING",
            failureExplanation: ["Encryption key not found [DOTENV_ENC_KEY__LOCAL]"],
        },
        {
            status: CW.StatusCryptoWrapperResult.success,
            oldDotenvVariableName: "UNENCRYPTED__UNIT_TEST_ALL__TEXT",
            newDotenvVariableName: "CIPHERED__UNIT_TEST_ALL__TEXT",
            failureExplanation: [],
            result: "xDm/uXdrH44FB0iK.XfFjBw==.347ldwXmKt7ICwo+iDUvhQ==",
        },
    ];
    const ciphered = new DP.DotenvParserCipheredVariable();
    ciphered.parseObject({
        CIPHERED__LOCAL__MISSING:
            "O11pWlZR6i7/Mc4G.AlecwB2mG8gDTutThGqqj/W4yeU=.MtwwmOEO2XYrC/+yfsCZqg==",
        CIPHERED__UNIT_TEST_ALL__TEXT: "SeVEe32LKEQpVWpA.dyiYCA==.Z51cTBKtEM9wRNAWteaNKw==",
        CIPHERED__WILDCARD__TEST_ALL_KEYS: "SeVEe32LKEQpVWpA.dyiYCA==.Z51cTBKtEM9wRNAWteaNKw==",
        CIPHERED__WILDCARD__BAD: "deVEe32LKEQpVWpA.dyiYCA==.Z51cTBKtEM9wRNAWteaNKw==",
        CIPHERED__UNIT_TEST_ALL__BAD:
            "O11pWlZR6i7/Mc4G.AlecwB2mG5gDTutThGqqj/W4yeU=.MtwwmOEO2XYrC/+yfsCZqg==",
        CIPHERED__UNIT_TEST_ALL__IV_SHORT:
            "O11pWl6i7/Mc4G.AlecwB2mG8gDTutThGqqj/W4yeU=.MtwwmOEO2XYrC/+yfsCZqg==",
        CIPHERED__UNIT_TEST_ALL__CIPHER_SHORT:
            "O11pWlZR6i7/Mc4G.AecwB2mG8gDTutThGqqj/W4yeU=.MtwwmOEO2XYrC/+yfCZqg==",
        CIPHERED__UNIT_TEST_ALL__TAG_SHORT:
            "O11pWlZR6i7/Mc4G.AlecwB2mG8gDTutThGqqj/W4yeU=.MtwwmOEO2XYrC/+yfsCZqg==",
    });
    const cipheredResult: CW.CryptoWrapperResult[] = [
        {
            status: CW.StatusCryptoWrapperResult.missingEncryptionKey,
            oldDotenvVariableName: "CIPHERED__LOCAL__MISSING",
            newDotenvVariableName: "UNENCRYPTED__LOCAL__MISSING",
            failureExplanation: ["Encryption key not found [LOCAL]"],
        },
        {
            status: CW.StatusCryptoWrapperResult.success,
            oldDotenvVariableName: "CIPHERED__UNIT_TEST_ALL__TEXT",
            newDotenvVariableName: "UNENCRYPTED__UNIT_TEST_ALL__TEXT",
            failureExplanation: [],
            result: "text",
        },
        {
            status: CW.StatusCryptoWrapperResult.success,
            oldDotenvVariableName: "CIPHERED__WILDCARD__TEST_ALL_KEYS",
            newDotenvVariableName: "UNENCRYPTED__WILDCARD__TEST_ALL_KEYS",
            failureExplanation: [],
            result: "text",
        },
        {
            status: CW.StatusCryptoWrapperResult.wildcardNoKeysMatch,
            oldDotenvVariableName: "CIPHERED__WILDCARD__BAD",
            newDotenvVariableName: "UNENCRYPTED__WILDCARD__BAD",
            failureExplanation: [
                "None of the encryption keys could decrypt [CIPHERED__WILDCARD__BAD]",
                "Exception: Variable: [CIPHERED__WILDCARD__BAD], Message: [Unsupported state or unable to authenticate data]",
            ],
        },
        {
            status: CW.StatusCryptoWrapperResult.exception,
            oldDotenvVariableName: "CIPHERED__UNIT_TEST_ALL__BAD",
            newDotenvVariableName: "UNENCRYPTED__UNIT_TEST_ALL__BAD",
            failureExplanation: [
                "Exception: Variable: [CIPHERED__UNIT_TEST_ALL__BAD], Message: [Unsupported state or unable to authenticate data]",
            ],
            result: undefined,
        },
        {
            status: CW.StatusCryptoWrapperResult.exception,
            oldDotenvVariableName: "CIPHERED__UNIT_TEST_ALL__IV_SHORT",
            newDotenvVariableName: "UNENCRYPTED__UNIT_TEST_ALL__IV_SHORT",
            failureExplanation: [
                "Exception: Variable: [CIPHERED__UNIT_TEST_ALL__IV_SHORT], Message: [Unsupported state or unable to authenticate data]",
            ],
            result: undefined,
        },
        {
            status: CW.StatusCryptoWrapperResult.exception,
            oldDotenvVariableName: "CIPHERED__UNIT_TEST_ALL__CIPHER_SHORT",
            newDotenvVariableName: "UNENCRYPTED__UNIT_TEST_ALL__CIPHER_SHORT",
            failureExplanation: [
                "Exception: Variable: [CIPHERED__UNIT_TEST_ALL__CIPHER_SHORT], Message: [Unsupported state or unable to authenticate data]",
            ],
            result: undefined,
        },
        {
            status: CW.StatusCryptoWrapperResult.exception,
            oldDotenvVariableName: "CIPHERED__UNIT_TEST_ALL__TAG_SHORT",
            newDotenvVariableName: "UNENCRYPTED__UNIT_TEST_ALL__TAG_SHORT",
            failureExplanation: [
                "Exception: Variable: [CIPHERED__UNIT_TEST_ALL__TAG_SHORT], Message: [Unsupported state or unable to authenticate data]",
            ],
            result: undefined,
        },
    ];

    it("CryptoWrapperAes256Gcm", () => {
        expect(CW.CryptoWrapperAes256Gcm.SYM_ENC_ALGO).toEqual("aes-256-gcm");

        expect(CW.CryptoWrapperAes256Gcm.SYM_ENC_IV_LENGTH).toEqual(12);

        expect(CW.CryptoWrapperAes256Gcm.SYM_ENC_KEY_LENGTH).toEqual(32);

        expect(CW.CryptoWrapperAes256Gcm.SYM_ENC_TAG_LENGTH).toEqual(16);

        expect(cw.algo()).toEqual("aes-256-gcm");
    });

    it("newDotEnvVariableName(unencrypted)", () => {
        expect(cw.newDotEnvVariableName(unencrypted.variables[0])).toEqual(
            unencryptedResult[0].newDotenvVariableName
        );
    });

    it("newDotEnvVariableName(ciphered)", () => {
        expect(cw.newDotEnvVariableName(ciphered.variables[0])).toEqual(
            cipheredResult[0].newDotenvVariableName
        );
    });

    it("newDotEnvVariableName(bad text)", () => {
        const dv = new DV.DotenvVariable("l", "r", "--", "*");
        dv.leftSideTokens.set(DV.LeftSideTokenIds.pattern, "pattern");
        dv.leftSideTokens.set(DV.LeftSideTokenIds.cryptoKeyName, "cryptoKeyName");
        dv.leftSideTokens.set(DV.LeftSideTokenIds.variableName, "variableName");
        // cw.newDotEnvVariableName(dv);

        expect(() => {
            cw.newDotEnvVariableName(dv);
        }).toThrow();
    });

    it("encryptWithKeyManager(unencrypted)", () => {
        const res = cw.encryptWithKeyManager(unencrypted.variables);
        expect(res[0]).toEqual(unencryptedResult[0]);
        expect(res[1].status).toEqual(CW.StatusCryptoWrapperResult.success);
        expect(res[1].oldDotenvVariableName).toEqual("UNENCRYPTED__UNIT_TEST_ALL__TEXT");
        expect(res[1].newDotenvVariableName).toEqual("CIPHERED__UNIT_TEST_ALL__TEXT");
    });

    it("decryptWithKeyManager(ciphered)", () => {
        const res = cw.decryptWithKeyManager(ciphered.variables);
        expect(res).toEqual(cipheredResult);
    });

    it("encrypt provide incorrect key", () => {
        const badVariable = unencrypted.variables[0];
        expect(badVariable).toBeDefined();

        const wrongKeyType = JWK.generateSync("EC");

        const result = badVariable && cw.encrypt(badVariable, wrongKeyType);
        const expectedResult: CW.CryptoWrapperResult = {
            status: CW.StatusCryptoWrapperResult.exception,
            oldDotenvVariableName: "UNENCRYPTED__LOCAL__MISSING",
            newDotenvVariableName: "CIPHERED__LOCAL__MISSING",
            failureExplanation: [
                "Exception: Variable: [UNENCRYPTED__LOCAL__MISSING], Message: [Invalid key object type private, expected secret.]",
            ],
        };
        expect(result).toEqual(expectedResult);
    });
});
