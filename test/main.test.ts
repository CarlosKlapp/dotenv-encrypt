import "jest-extended";
import { parseArgs } from "../src/args";
import { mainImplementation } from "../src/main";
import dotenv from "dotenv";
import fs from "fs";
import rimraf from "rimraf";
import { compareJsonFile, compareTextFile } from "./util";
import mkdirp from "mkdirp";

let mockExit: jest.SpyInstance;
let mockConsoleLog: jest.SpyInstance;
let mockConsoleError: jest.SpyInstance;

beforeAll(() => {
    mockExit = jest.spyOn(process, "exit").mockImplementation();
    mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
    mockConsoleError = jest.spyOn(console, "error").mockImplementation();

    // Load the expected encryption keys into the process.env
    // For these variables, overwrite any existing variables.
    const buffer = fs.readFileSync("./test/env_test_files/env_test_keys_no_errors.txt");
    const parsed = dotenv.parse(buffer);

    Object.keys(parsed).forEach(function (key) {
        // Overwrite env value. This behavior differs from dotenv.
        process.env[key] = parsed[key];
    });

    mkdirp.sync("./test/env_test_files/");
    mkdirp.sync("./test/results/bak/dotenv_processor/");
    mkdirp.sync("./test/results/bak/index/dec/");
    mkdirp.sync("./test/results/bak/index/enc/");
    mkdirp.sync("./test/results/log/");
    mkdirp.sync("./test/results/out/in_place/dec/");
    mkdirp.sync("./test/results/out/in_place/enc/");
    mkdirp.sync("./test/results/out/index/dec/");
    mkdirp.sync("./test/results/out/index/enc/");
});

beforeEach(() => {
    mockExit.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
});

afterAll(() => {
    mockExit.mockRestore();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
});

describe("Test command line: kdec, kenc", () => {
    it("kenc", () => {
        const argString: string[] = [
            "kenc",
            "UNENCRYPTED__DEV__EMAIL_API=EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c",
        ];
        const args = parseArgs(argString);
        mainImplementation(args, true);
        expect(mockConsoleLog).toHaveBeenCalledWith(
            "CIPHERED__DEV__EMAIL_API=AAAAAAAAAAAAAAAA.E18xos0gi0KsKuz9Mz19piDCnHX4E5pkiPxralKCtdkw3v+02XD3.QM/KMFRW/jTbPzO5AE0w2w=="
        );
    });

    it("kdec", () => {
        const argString: string[] = [
            "kdec",
            "CIPHERED__DEV__EMAIL_API=AAAAAAAAAAAAAAAA.E18xos0gi0KsKuz9Mz19piDCnHX4E5pkiPxralKCtdkw3v+02XD3.QM/KMFRW/jTbPzO5AE0w2w==",
        ];
        const args = parseArgs(argString);
        mainImplementation(args, true);
        expect(mockConsoleLog).toHaveBeenCalledWith(
            "UNENCRYPTED__DEV__EMAIL_API=EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c"
        );
    });

    it("kdec error", () => {
        const argString: string[] = [
            "kdec",
            "CIPHERED__DEV__EMAIL_API=BAAAAAAAAAAAAAAA.E18xos0gi0KsKuz9Mz19piDCnHX4E5pkiPxralKCtdkw3v+02XD3.QM/KMFRW/jTbPzO5AE0w2w==",
        ];
        const args = parseArgs(argString);
        mainImplementation(args, true);
        expect(mockConsoleLog).toHaveBeenCalledWith([
            "Exception: Variable: [CIPHERED__DEV__EMAIL_API], Message: [Unsupported state or unable to authenticate data]",
        ]);
    });
});

describe("Test command line: xdec, xenc", () => {
    it("xenc", () => {
        const argString: string[] = [
            "xenc",
            "DEV",
            "EMAIL_API",
            "EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c",
        ];
        const args = parseArgs(argString);
        mainImplementation(args, true);
        expect(mockConsoleLog).toHaveBeenCalledWith(
            "CIPHERED__DEV__EMAIL_API=AAAAAAAAAAAAAAAA.E18xos0gi0KsKuz9Mz19piDCnHX4E5pkiPxralKCtdkw3v+02XD3.QM/KMFRW/jTbPzO5AE0w2w=="
        );
    });

    it("xdec", () => {
        const argString: string[] = [
            "xdec",
            "DEV",
            "EMAIL_API",
            "q6M1bArrP6vCQooz.ZUi7rAgMG+KrOOVJ1qKyYB7W/umPFKZTGZ5UIh5JBBGlRTluS2yr.CcggXA5pndStr4MjczcwDg==",
        ];
        const args = parseArgs(argString);
        mainImplementation(args, true);
        expect(mockConsoleLog).toHaveBeenCalledWith(
            "UNENCRYPTED__DEV__EMAIL_API=EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c"
        );
    });

    it("xdec insufficient args", () => {
        const argString: string[] = ["xdec", "DEV", "EMAIL_API"];
        parseArgs(argString);
        expect(mockExit).toHaveBeenCalledWith(1);
        expect(mockConsoleError).toHaveBeenCalledTimes(3);
        expect(mockConsoleError.mock.calls[2][0]).toEqual(
            "Not enough non-option arguments: got 2, need at least 3"
        );
    });
});

describe("Test command line: test, enc, dec", () => {
    it("test no backup", () => {
        const argString: string[] = [
            "test",
            "-f",
            "./test/env_test_files/.env.mixed",
            "./test/env_test_files/.env.noerror",
            "--no-backup",
            "--jsonOutput",
            "./test/results/log/dotenv-encrypt_log.main.end_to_end.test.json",
            "--useRelativePaths",
        ];
        const args = parseArgs(argString);
        mainImplementation(args, true);
        // Compare JSON output
        let resJsonCompare = compareJsonFile(
            "./test/expected_results/dotenv-encrypt_log.main.end_to_end.test.json",
            "./test/results/log/dotenv-encrypt_log.main.end_to_end.test.json"
        );
        expect(resJsonCompare.obj1).toEqual(resJsonCompare.obj2);
    });

    it("test with backup", () => {
        const argString: string[] = [
            "test",
            "-f",
            "./test/env_test_files/.env.mixed",
            "./test/env_test_files/.env.noerror",
            "--backup",
            "--jsonOutput",
            "./test/results/log/dotenv-encrypt_log.main.end_to_end.test.json",
            "--useRelativePaths",
        ];
        const args = parseArgs(argString);
        mainImplementation(args, true);
        // Compare JSON output
        let resJsonCompare = compareJsonFile(
            "./test/expected_results/dotenv-encrypt_log.main.end_to_end.test.json",
            "./test/results/log/dotenv-encrypt_log.main.end_to_end.test.json"
        );
        expect(resJsonCompare.obj1).toEqual(resJsonCompare.obj2);
    });

    it("enc", () => {
        const argString: string[] = [
            "enc",
            "-f",
            "./test/env_test_files/.env.mixed",
            "./test/env_test_files/.env.noerror",
            "--output",
            "./test/results/out/index/enc/",
            "--backupFolder",
            "./test/results/bak/index/enc/",
            "--jsonOutput",
            "./test/results/log/dotenv-encrypt_log.main.end_to_end.enc.json",
            "--useRelativePaths",
        ];
        const args = parseArgs(argString);
        mainImplementation(args, true);

        // Compare encrypted/decrypted ouput
        let resTextCompare = compareTextFile(
            "./test/expected_results/.env.mixed.enc.txt",
            "./test/results/out/index/enc/.env.mixed"
        );
        expect(resTextCompare.text1).toEqual(resTextCompare.text2);

        resTextCompare = compareTextFile(
            "./test/expected_results/.env.noerror.enc.txt",
            "./test/results/out/index/enc/.env.noerror"
        );
        expect(resTextCompare.text1).toEqual(resTextCompare.text2);

        // Compare backup files
        resTextCompare = compareTextFile(
            "./test/expected_results/.env.mixed.enc.txt",
            "./test/results/out/index/enc/.env.mixed"
        );
        expect(resTextCompare.text1).toEqual(resTextCompare.text2);

        resTextCompare = compareTextFile(
            "./test/expected_results/.env.noerror.enc.txt",
            "./test/results/out/index/enc/.env.noerror"
        );
        expect(resTextCompare.text1).toEqual(resTextCompare.text2);

        // Compare JSON output
        let resJsonCompare = compareJsonFile(
            "./test/expected_results/dotenv-encrypt_log.main.end_to_end.enc.json",
            "./test/results/log/dotenv-encrypt_log.main.end_to_end.enc.json"
        );
        expect(resJsonCompare.obj1).toEqual(resJsonCompare.obj2);
    });

    it("dec", () => {
        const argString: string[] = [
            "dec",
            "-f",
            "./test/env_test_files/.env.mixed",
            "./test/env_test_files/.env.noerror",
            "--output",
            "./test/results/out/index/dec/",
            "--backupFolder",
            "./test/results/bak/index/dec/",
            "--jsonOutput",
            "./test/results/log/dotenv-encrypt_log.main.end_to_end.dec.json",
            "--useRelativePaths",
        ];
        const args = parseArgs(argString);
        mainImplementation(args, true);

        // Compare encrypted/decrypted ouput
        let resTextCompare = compareTextFile(
            "./test/expected_results/.env.mixed.dec.txt",
            "./test/results/out/index/dec/.env.mixed"
        );
        expect(resTextCompare.text1).toEqual(resTextCompare.text2);

        resTextCompare = compareTextFile(
            "./test/expected_results/.env.noerror.dec.txt",
            "./test/results/out/index/dec/.env.noerror"
        );
        expect(resTextCompare.text1).toEqual(resTextCompare.text2);

        // Compare backup files
        resTextCompare = compareTextFile(
            "./test/expected_results/.env.mixed.dec.txt",
            "./test/results/out/index/dec/.env.mixed"
        );
        expect(resTextCompare.text1).toEqual(resTextCompare.text2);

        resTextCompare = compareTextFile(
            "./test/expected_results/.env.noerror.dec.txt",
            "./test/results/out/index/dec/.env.noerror"
        );
        expect(resTextCompare.text1).toEqual(resTextCompare.text2);

        // Compare JSON output
        let resJsonCompare = compareJsonFile(
            "./test/expected_results/dotenv-encrypt_log.main.end_to_end.dec.json",
            "./test/results/log/dotenv-encrypt_log.main.end_to_end.dec.json"
        );
        expect(resJsonCompare.obj1).toEqual(resJsonCompare.obj2);
    });
});

describe.each([
    ["enc", "backup"],
    ["enc", "no-backup"],
    ["dec", "backup"],
    ["dec", "no-backup"],
])("Test command line in place processing - %s - %s", (operation, backupFlag) => {
    const cwd = process.cwd();
    const folder = `./test/results/out/in_place/${operation}`;

    afterEach(() => {
        process.chdir(cwd);
    });

    it("Test in place", () => {
        [
            ".env.mixed",
            ".env.noerror",
            ".env.mixed.bak",
            ".env.noerror.bak",
            "dotenv-encrypt_log.json",
        ].map((x) => rimraf.sync(`${folder}/${x}`, { disableGlob: true }));

        fs.copyFileSync("./test/env_test_files/.env.mixed", `${folder}/.env.mixed`);
        fs.copyFileSync("./test/env_test_files/.env.noerror", `${folder}/.env.noerror`);

        process.chdir(folder);

        const argString: string[] = [
            operation,
            "-f",
            ".env.mixed",
            ".env.noerror",
            "--useRelativePaths",
            `--${backupFlag}`,
        ];
        const args = parseArgs(argString);
        mainImplementation(args, true);

        process.chdir(cwd);

        let resTextCompare = compareTextFile(
            `./test/expected_results/.env.mixed.${operation}.txt`,
            `./test/results/out/in_place/${operation}/.env.mixed`
        );
        expect(resTextCompare.text1).toEqual(resTextCompare.text2);

        resTextCompare = compareTextFile(
            `./test/expected_results/.env.noerror.${operation}.txt`,
            `./test/results/out/in_place/${operation}/.env.noerror`
        );
        expect(resTextCompare.text1).toEqual(resTextCompare.text2);

        if (backupFlag === "backup") {
            resTextCompare = compareTextFile(
                `./test/env_test_files/.env.noerror`,
                `./test/results/out/in_place/${operation}/.env.noerror.bak`
            );
            expect(resTextCompare.text1).toEqual(resTextCompare.text2);

            resTextCompare = compareTextFile(
                `./test/env_test_files/.env.mixed`,
                `./test/results/out/in_place/${operation}/.env.mixed.bak`
            );
            expect(resTextCompare.text1).toEqual(resTextCompare.text2);
        } else {
            expect(
                fs.existsSync(`./test/results/out/in_place/${operation}/.env.mixed.bak`)
            ).toBeFalse();
            expect(
                fs.existsSync(`./test/results/out/in_place/${operation}/.env.noerror.bak`)
            ).toBeFalse();
        }

        let resJsonCompare = compareJsonFile(
            `./test/expected_results/dotenv-encrypt_log.main.in_place.${operation}.${backupFlag}.json`,
            `./test/results/out/in_place/${operation}/dotenv-encrypt_log.json`
        );
        expect(resJsonCompare.obj1).toEqual(resJsonCompare.obj2);
    });
});

describe("No files found", () => {
    it("No files", () => {
        mkdirp.sync("./test/empty_folder/");
        const argString: string[] = ["enc", "-f", "./test/empty_folder/", "--useRelativePaths"];
        const args = parseArgs(argString);
        mainImplementation(args, true);
        expect(mockConsoleLog).toHaveBeenCalledWith("No files found");
    });
});

describe("No backup specified", () => {
    it("Enc no backup", () => {
        mkdirp.sync("./test/empty_folder/");
        const argString: string[] = [
            "enc",
            "-f",
            "./test/empty_folder/",
            "--no-backup",
            "--useRelativePaths",
        ];
        const args = parseArgs(argString);
        mainImplementation(args, true);
        expect(mockConsoleLog).toHaveBeenCalledWith("No files found");
    });
});
