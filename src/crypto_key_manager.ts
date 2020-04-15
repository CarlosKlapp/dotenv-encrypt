import _ from "lodash";
import { JWKS, JWK, KeyParameters } from "jose";
import { DotenvParserCryptoKey } from "./dotenv_parser";
import { CryptoWrapperAes256Gcm } from "./crypto_wrapper";
import assert from "assert";

/**
 * Class used to load and manage the encryption keys
 */
export class CryptoKeyManager {
    jwks = new JWKS.KeyStore();
    parser = new DotenvParserCryptoKey();

    /**
     * Do any of the encryption keys have errors
     */
    hasErrors(): boolean {
        return this.parser.variableInvalid.length > 0;
    }

    /**
     * Return all the encryption key errors
     */
    errors(): string[] {
        return _.flatten(this.parser.variableInvalid.map(x => x.errors));
    }

    /**
     * Given the encryption key name, generate the full name including the prefix and
     * separators.
     * @param keyName Name of the encryption key to find
     */
    buildDotenvNameFromKeyName(keyName: string): string {
        return `${this.parser.cryptoKeyNamePrefix}${this.parser.separatorLeft}${keyName}`;
    }

    /**
     * Load the encryption keys from the process.env. This is the default.
     */
    loadFromEnv(): void {
        this.loadFromObject(process.env);
    }

    /**
     * Any object can be with key value pairs can be used
     * @param env and object with key value pairs
     */
    loadFromObject(env: object): void {
        this.parser.parseObject(env);

        this.parser.variables.forEach(x => {
            const params: KeyParameters = {
                alg: "aes-256-gcm",
                kid: x.leftCryptoKeyName(),
                key_ops: ["encrypt", "decrypt"],
                use: "enc",
            };
            const jwk = JWK.asKey(Buffer.from(x.rightSide, "base64"), params);

            assert(jwk.keyObject.symmetricKeySize); // should never be undefined
            if (
                (jwk.keyObject.symmetricKeySize as number) <
                CryptoWrapperAes256Gcm.SYM_ENC_KEY_LENGTH
            ) {
                x.errors.push(
                    `Encryption key [${
                        x.leftSide
                    }] is too short. Expected a length of 32 bytes (256bits) and received ${jwk
                        .keyObject.symmetricKeySize as number} bytes.`
                );
                // Add this variable to the list of invalid variables
                this.parser.variableInvalid.push(x);
            } else {
                this.jwks.add(jwk);
            }
        });

        // Remove any variables we just determined to be invalid
        // We do this now, because it is complicated to iterate over an array and add/remove at the same time
        _.pullAll(this.parser.variables, this.parser.variableInvalid);
    }

    /**
     * Get a specific key
     * @param keyName Name of the encryption key to find
     */
    get(keyName?: string): JWK.Key {
        const query: JWKS.KeyQuery = {
            kid: keyName,
        };
        return this.jwks.get(query);
    }

    /**
     * Return all of the encryption keys
     */
    all(): JWK.Key[] {
        return this.jwks.all();
    }

    /**
     * Return all of the encryption key names as an array of strings
     */
    allKeys(): string[] {
        return this.jwks.all().map(x => x.kid);
    }
}
