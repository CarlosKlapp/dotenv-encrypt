import * as CKM from "../src/crypto_key_manager";
import "jest-extended";
// import { JWK } from "jose";
// import * as CW from "../src/crypto_wrapper";

const keys = {
    DOTENV_ENC_KEY__UNIT_TEST_ALL: "IEs6KmY5awWIi62UTwVsozl2dFDZUuReVpPLQ/8WCzU=",
    DOTENV_ENC_KEY__WILDCARD: "IEs6KmY5awWIi62UTwVsozl2dFDZUuReVpPLQ/8WCzU=", // invalid name
    DOTENV_ENC_KEY__UNIT_TEST_TOO_SMALL: "4fziNa9iDylQmkz6vJce7oSly1p3uge36ORwJUBt",
};

describe("Test CryptoKeyManager key loading", () => {
    it("Load from environment", () => {
        process.env["DOTENV_ENC_KEY__UNIT_TEST_LOAD_FROM_ENV"] =
            "rogYkzTTNMkvGCADATeOKLZ2pnmcPyvntd+SCjoLzhQ=";

        const ckm = new CKM.CryptoKeyManager();
        ckm.loadFromEnv();

        const jwk = ckm.get("UNIT_TEST_LOAD_FROM_ENV");
        expect(jwk).toBeDefined();
        expect(jwk.alg).toEqual("aes-256-gcm");
        expect(jwk.k).toEqual("rogYkzTTNMkvGCADATeOKLZ2pnmcPyvntd-SCjoLzhQ");
        expect(!jwk.private);
        expect(!jwk.public);
        expect(jwk.secret);
        expect(jwk.keyObject.symmetricKeySize).toBe(32);
    });

    it("Load from object", () => {
        const ckm = new CKM.CryptoKeyManager();
        ckm.loadFromObject(keys);

        expect(ckm.allKeys()).toEqual(["UNIT_TEST_ALL"]);

        expect(ckm.allKeys()).toBeArrayOfSize(1);
        expect(ckm.all()).toBeArrayOfSize(1);

        const jwk = ckm.get("UNIT_TEST_ALL");
        expect(jwk).toBeDefined();

        expect(ckm.buildDotenvNameFromKeyName("UNIT_TEST_ALL")).toBe(
            "DOTENV_ENC_KEY__UNIT_TEST_ALL"
        );

        expect(ckm.hasErrors()).toBeTrue();

        expect(ckm.errors()).toEqual([
            "The encryption key name [DOTENV_ENC_KEY__WILDCARD] is the reserved word [WILDCARD].",
            "Encryption key [DOTENV_ENC_KEY__UNIT_TEST_TOO_SMALL] is too short. Expected a length of 32 bytes (256bits) and received 30 bytes.",
        ]);
    });
});
