import "jest-extended";
import * as DP from "../src/dotenv_processor";
import * as CKM from "../src/crypto_key_manager";
import fs from "fs";
import dotenv from "dotenv";
import { Feedback } from "../src/feedback";
import _ from "lodash";
import { compareJsonFile, compareTextFile } from "./util";
// import jsdiff from "diff";

interface TestData {
    operation: string;
    srcFile: string;
    outFile: string;
    backupFile: string;
    expectedOutFile: string;
    expectedFeedbackFile: string;
    expectedTestFeedbackFile: string;
}

const testData: TestData[] = [
    {
        operation: "enc",
        srcFile: "./test/env_test_files/.env.mixed",
        outFile: "./test/results/out/.env.mixed.enc",
        backupFile: "./test/results/bak/dotenv_processor/.env.mixed.enc.bak",
        expectedOutFile: "./test/expected_results/.env.mixed.enc.txt",
        expectedFeedbackFile: "./test/expected_results/.env.mixed.enc.feedback.json",
        expectedTestFeedbackFile: "./test/expected_results/.env.mixed.enc.test.feedback.json",
    },
    {
        operation: "dec",
        srcFile: "./test/env_test_files/.env.mixed",
        outFile: "./test/results/out/.env.mixed.dec",
        backupFile: "./test/results/bak/dotenv_processor/.env.mixed.dec.bak",
        expectedOutFile: "./test/expected_results/.env.mixed.dec.txt",
        expectedFeedbackFile: "./test/expected_results/.env.mixed.dec.feedback.json",
        expectedTestFeedbackFile: "./test/expected_results/.env.mixed.dec.test.feedback.json",
    },
    {
        operation: "enc",
        srcFile: "./test/env_test_files/.env.noerror",
        outFile: "./test/results/out/.env.noerror.enc",
        backupFile: "./test/results/bak/dotenv_processor/.env.noerror.enc.bak",
        expectedOutFile: "./test/expected_results/.env.noerror.enc.txt",
        expectedFeedbackFile: "./test/expected_results/.env.noerror.enc.feedback.json",
        expectedTestFeedbackFile: "./test/expected_results/.env.noerror.enc.test.feedback.json",
    },
    {
        operation: "dec",
        srcFile: "./test/env_test_files/.env.noerror",
        outFile: "./test/results/out/.env.noerror.dec",
        backupFile: "./test/results/bak/dotenv_processor/.env.noerror.dec.bak",
        expectedOutFile: "./test/expected_results/.env.noerror.dec.txt",
        expectedFeedbackFile: "./test/expected_results/.env.noerror.dec.feedback.json",
        expectedTestFeedbackFile: "./test/expected_results/.env.noerror.dec.test.feedback.json",
    },
];

describe("Test DotenvProcessor constructor", () => {
    it("Load from dotenv via buffer", () => {
        const bufferKeys = fs.readFileSync("./test/env_test_files/env_test_keys_with_errors.txt");
        const envKeys = dotenv.parse(bufferKeys);
        const cryptoKeyManager = new CKM.CryptoKeyManager();
        // Load the keys from the environment. Could be loaded from a dotenv file.
        cryptoKeyManager.loadFromObject(envKeys);
        const dp = new DP.DotenvProcessor(
            cryptoKeyManager,
            fs.readFileSync("./test/env_test_files/.env.noerror")
        );
        expect(dp).not.toBeUndefined();
        expect(dp.defaultBackupPath()).toEqual("no_file_name_specified.bak");
    });
});

describe("Test DotenvProcessor", () => {
    const bufferKeys = fs.readFileSync("./test/env_test_files/env_test_keys_with_errors.txt");
    const envKeys = dotenv.parse(bufferKeys);
    const cryptoKeyManager = new CKM.CryptoKeyManager();
    // Load the keys from the environment. Could be loaded from a dotenv file.
    cryptoKeyManager.loadFromObject(envKeys);
    const createExpectedValues = false;

    it("Decrypted values into process.env", () => {
        const dp = new DP.DotenvProcessor(cryptoKeyManager, testData[0].srcFile, true);
        const parsed = dotenv.parse(testData[0].srcFile);
        dp.decryptToProcessEnvironment();

        Object.keys(parsed).forEach((key) => {
            expect(process.env[key]).toEqual(parsed[key]);
        });

        // Clean environment variables
        Object.keys(parsed).forEach((key) => {
            delete process.env[key];
        });

        Object.keys(parsed).forEach((key) => {
            expect(process.env[key]).not.toBeDefined();
        });
    });

    it.each(testData.map((x) => _.values(x)))(
        "Test %s %s",
        (
            operation: string,
            srcFile: string,
            outFile: string,
            backupFile: string,
            expectedOutFile: string,
            expectedFeedbackFile: string,
            expectedTestFeedbackFile: string
        ) => {
            const dp = new DP.DotenvProcessor(cryptoKeyManager, srcFile, true);
            dp.createBackupFile(backupFile);

            const feedback: Feedback =
                operation === "enc" ? dp.encryptToFile(outFile) : dp.decryptToFile(outFile);

            const feedbackTest: Feedback = dp.test();

            if (createExpectedValues) {
                fs.copyFileSync(outFile, expectedOutFile);
                fs.writeFileSync(expectedFeedbackFile, JSON.stringify(feedback, null, "\t"));
                fs.writeFileSync(
                    expectedTestFeedbackFile,
                    JSON.stringify(feedbackTest, null, "\t")
                );
            } else {
                let resJsonCompare = compareJsonFile(expectedFeedbackFile, feedback);
                expect(resJsonCompare.obj1).toEqual(resJsonCompare.obj2);

                resJsonCompare = compareJsonFile(expectedTestFeedbackFile, feedbackTest);
                expect(resJsonCompare.obj1).toEqual(resJsonCompare.obj2);

                let resTextCompare = compareTextFile(expectedOutFile, outFile);
                expect(resTextCompare.text1).toEqual(resTextCompare.text2);

                resTextCompare = compareTextFile(backupFile, srcFile);
                expect(resTextCompare.text1).toEqual(resTextCompare.text2);
            }
            expect(dp.defaultBackupPath()).toEqual(`${srcFile}.bak`);
        }
    );
});

describe("Test DotenvProcessor createFileNameForBackupFile", () => {
    const bufferKeys = fs.readFileSync("./test/env_test_files/env_test_keys_with_errors.txt");
    const envKeys = dotenv.parse(bufferKeys);
    const cryptoKeyManager = new CKM.CryptoKeyManager();
    // Load the keys from the environment. Could be loaded from a dotenv file.
    cryptoKeyManager.loadFromObject(envKeys);

    it("createFileNameForBackupFile empty no default file name", () => {
        const dp = new DP.DotenvProcessor(
            cryptoKeyManager,
            fs.readFileSync("./test/env_test_files/.env.noerror")
        );
        let txt = dp.createFileNameForBackupFile();
        expect(txt).toEqual("no_file_name_specified.bak");
    });

    it("createFileNameForBackupFile empty", () => {
        const dp = new DP.DotenvProcessor(cryptoKeyManager, "./test/env_test_files/.env.noerror");
        let txt = dp.createFileNameForBackupFile();
        expect(txt).toEqual("./test/env_test_files/.env.noerror.bak");
    });

    it("createFileNameForBackupFile path", () => {
        const dp = new DP.DotenvProcessor(
            cryptoKeyManager,
            fs.readFileSync("./test/env_test_files/.env.noerror")
        );
        let txt = dp.createFileNameForBackupFile("test/env_test_files/.env.mixed");
        expect(txt).toEqual("test/env_test_files/.env.mixed.bak");
    });
});
