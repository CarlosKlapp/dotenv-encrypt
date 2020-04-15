import { CryptoKeyManager } from "./crypto_key_manager";
import { DotenvProcessor } from "./dotenv_processor";
import { CryptoWrapperResult, StatusCryptoWrapperResult } from "./crypto_wrapper";

export const decryptProcessEnvironment = (): CryptoWrapperResult[] => {
    const cryptoKeyManager = new CryptoKeyManager();
    // Load the keys from the environment. Could be loaded from a dotenv file.
    cryptoKeyManager.loadFromEnv();

    const dotenvProcessor = new DotenvProcessor(cryptoKeyManager);
    const res = dotenvProcessor.decrypt();
    
    res.filter((x) => x.status === StatusCryptoWrapperResult.success).forEach((x) => {
        // Overwrite env value. This behavior differs from dotenv.
        process.env[x.newDotenvVariableName] = x.result;
    });
    return res;
};
