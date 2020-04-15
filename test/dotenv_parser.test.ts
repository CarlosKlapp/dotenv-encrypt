import "jest-extended";
import * as DP from "../src/dotenv_parser";
// import * as DV from "../src/dotenv_variable";
// import { JWK } from "jose";

const test_cases = {
    DOTENV_ENC_KEY__UNIT_TEST_ALL__TOO_MANY__PARAMS: "abc",
    DOTENV_ENC_KEY__OK: "abc",
    DOTENV_ENC_KEY: "abc",
    DOTENV_ENC_KEY__WILDCARD: "abc",
    UNENCRYPTED__UNIT_TEST_ALL__TOO_MANY__PARAMS: "abc",
    UNENCRYPTED__TOO_FEW_PARAMS: "abc",
    UNENCRYPTED: "abc",
    UNENCRYPTED__WILDCARD__BAD: "abc",
    UNENCRYPTED__UNIT_TEST_ALL__OK: "abc",
    CIPHERED__UNIT_TEST_ALL__TOO_MANY__LEFT_PARAMS: "abc",
    CIPHERED__TOO_FEW_PARAMS_LEFT: "abc",
    CIPHERED: "abc",
    CIPHERED__WILDCARD__OK: "a.b.c",
    CIPHERED__VERY_LONG_IMPROBABLE_RESERVED_WORD_USED_FOR_TESTING__RESERVED_WORD: "a.b.c",
    CIPHERED__UNIT_TEST_ALL__OK: "a.b.c",
    CIPHERED__UNIT_TEST_ALL__TOO_MANY_PARAMS_RIGHT: "a.b.c.d",
    CIPHERED__UNIT_TEST_ALL__TOO_FEW_PARAMS_RIGHT: "a.b",
};

describe("Test DotenvParser constructor", () => {
    it("Test constructor no defaults", () => {
        const dp = new DP.DotenvParserTestConstructor({
            separatorLeft: "##",
            minTokensLeft: 7,
            maxTokensLeft: 8,
            separatorRight: "?",
            minTokensRight: 9,
            maxTokensRight: 1,
            cryptoKeyNamePrefix: "TEST",
        });
        expect(dp.tokenize("", "")).toBeUndefined();
    });

    it("Test constructor no defaults", () => {
        const dp = new DP.DotenvParserTestConstructor({});
        expect(dp.tokenize("", "")).toBeUndefined();
    });
});

describe("Test DotenvParser", () => {
    it("DotenvParserCryptoKey", () => {
        const dp = new DP.DotenvParserCryptoKey();
        dp.parseObject(test_cases);
        expect(dp.variables).toBeArrayOfSize(1);
        expect(dp.variableInvalid).toBeArrayOfSize(3);
        expect(dp.variablesAll).toBeArrayOfSize(4);
        expect(dp.variablesUsingReservedWord).toBeArrayOfSize(1);
    });

    it("DotenvParserCipheredVariable", () => {
        const dp = new DP.DotenvParserCipheredVariable();
        dp.parseObject(test_cases);
        expect(dp.variables).toBeArrayOfSize(2);
        expect(dp.variableInvalid).toBeArrayOfSize(6);
        expect(dp.variablesAll).toBeArrayOfSize(8);
        expect(dp.variablesUsingReservedWord).toBeArrayOfSize(1);
    });

    it("DotenvParserPlainTextVariable", () => {
        const dp = new DP.DotenvParserPlainTextVariable();
        dp.parseObject(test_cases);
        expect(dp.variables).toBeArrayOfSize(1);
        expect(dp.variableInvalid).toBeArrayOfSize(4);
        expect(dp.variablesAll).toBeArrayOfSize(5);
        expect(dp.variablesUsingReservedWord).toBeArrayOfSize(1);
    });
});
