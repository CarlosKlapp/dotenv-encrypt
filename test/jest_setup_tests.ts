import { fileGlob } from "../src/util";
import path from "path";
import _ from "lodash";

interface ExpectedFileList {
    folder: string;
    fileList: string[];
}

const expectedFileList: ExpectedFileList[] = [
    {
        folder: "./test/env_test_files/*",
        fileList: [
            "./test/env_test_files/.env.mixed",
            "./test/env_test_files/.env.noerror",
            "./test/env_test_files/env_test_keys_no_errors.txt",
            "./test/env_test_files/env_test_keys_with_errors.txt",
        ],
    },
    {
        folder: "./test/expected_results/*",
        fileList: [
            "./test/expected_results/.env.mixed.dec.feedback.json",
            "./test/expected_results/.env.mixed.dec.test.feedback.json",
            "./test/expected_results/.env.mixed.dec.txt",
            "./test/expected_results/.env.mixed.enc.feedback.json",
            "./test/expected_results/.env.mixed.enc.test.feedback.json",
            "./test/expected_results/.env.mixed.enc.txt",
            "./test/expected_results/.env.noerror.dec.feedback.json",
            "./test/expected_results/.env.noerror.dec.test.feedback.json",
            "./test/expected_results/.env.noerror.dec.txt",
            "./test/expected_results/.env.noerror.enc.feedback.json",
            "./test/expected_results/.env.noerror.enc.test.feedback.json",
            "./test/expected_results/.env.noerror.enc.txt",
            "./test/expected_results/dotenv-encrypt_log.main.end_to_end.dec.json",
            "./test/expected_results/dotenv-encrypt_log.main.end_to_end.enc.json",
            "./test/expected_results/dotenv-encrypt_log.main.end_to_end.test.json",
            "./test/expected_results/dotenv-encrypt_log.main.in_place.dec.backup.json",
            "./test/expected_results/dotenv-encrypt_log.main.in_place.dec.no-backup.json",
            "./test/expected_results/dotenv-encrypt_log.main.in_place.enc.backup.json",
            "./test/expected_results/dotenv-encrypt_log.main.in_place.enc.no-backup.json",
        ],
    },
];

const compareNumberOfExpectedFiles = () => {
    expectedFileList.forEach((x) => {
        const filesExpected = x.fileList.map((y) => path.relative("", y));
        const filesFound = fileGlob([x.folder])
            .map((x) => path.relative("", x))
            .sort();

        if (filesExpected.length !== filesFound.length) {
            debugger;
        }

        if (!_.isEqual(filesExpected, filesFound)) {
            debugger;
        }

        expect(filesExpected).toEqual(filesFound);
    });
};

beforeEach(() => {
    compareNumberOfExpectedFiles();
});

afterEach(() => {
    compareNumberOfExpectedFiles();
});
