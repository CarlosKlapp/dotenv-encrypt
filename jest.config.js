module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFilesAfterEnv: ["jest-extended", "./test/jest_setup_tests.ts"],
    // collectCoverage: true, // TRUE prevents debugging
    testPathIgnorePatterns: ["test/jest_util.ts", "test/jest_setup_tests.ts"],
};
