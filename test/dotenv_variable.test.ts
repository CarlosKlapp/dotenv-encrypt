import "jest-extended";
// import * as DP from "../src/dotenv_parser";
import * as DV from "../src/dotenv_variable";
import _ from "lodash";
// import { JWK } from "jose";

describe("Test DotenvVariable", () => {
    it("Test empty variable", () => {
        const dv = new DV.DotenvVariable("left", "right", "left_separator", "right_separator");
        expect(() => dv.leftCryptoKeyName()).toThrow();
        expect(() => dv.leftPattern()).toThrow();
        expect(() => dv.leftVariableName()).toThrow();
        expect(() => dv.rightCipheredText()).toThrow();
        expect(() => dv.rightIV()).toThrow();
        expect(() => dv.rightSignature()).toThrow();
    });

    it("Test isEqualCryptoKeyNameSeparatoVariableName", () => {
        const dv1 = new DV.DotenvVariable("left", "right", "___", "..");
        dv1.leftSideTokens.set(DV.LeftSideTokenIds.cryptoKeyName, "test_cryptoKeyName");
        dv1.leftSideTokens.set(DV.LeftSideTokenIds.pattern, "test_pattern");
        dv1.leftSideTokens.set(DV.LeftSideTokenIds.variableName, "test_variableName");

        let dv2: DV.DotenvVariable = _.cloneDeep(dv1);
        expect(DV.DotenvVariable.isEqualCryptoKeyNameSeparatoVariableName(dv1, dv2)).toBeTrue();

        dv2 = _.cloneDeep(dv1);
        dv2.leftSideTokens.set(DV.LeftSideTokenIds.cryptoKeyName, "mismatch_test_cryptoKeyName");
        expect(DV.DotenvVariable.isEqualCryptoKeyNameSeparatoVariableName(dv1, dv2)).toBeFalse();

        dv2 = _.cloneDeep(dv1);
        dv2.leftSideTokens.set(DV.LeftSideTokenIds.variableName, "mismatch_test_variableName");
        expect(DV.DotenvVariable.isEqualCryptoKeyNameSeparatoVariableName(dv1, dv2)).toBeFalse();

        dv2 = _.cloneDeep(dv1);
        dv2.separatorLeft = "+++";
        expect(DV.DotenvVariable.isEqualCryptoKeyNameSeparatoVariableName(dv1, dv2)).toBeFalse();
    });
});
