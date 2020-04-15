import yargs from "yargs/yargs";
import _ from "lodash";

// const argv = yargs(process.argv.slice(2));

export const parseArgs = (argv: string[]) => {
    let commandLineParserError = false;

    const yarg = yargs()
        .scriptName("dotenc")
        .usage("Usage: $0 <enc|kenc|xenc|dec|kdec|xdec|test> [options]")
        .command("enc", "Encrypt the variables inside the dotenv file")
        .command("dec", "Decrypt the variables inside the dotenv file")
        .command("kenc <keyvalue>", "Encrypt the command line value")
        .command("kdec <keyvalue>", "Decrypt the command line value")
        .command("xenc <key> <name> <value>", "Encrypt the command line value")
        .command("xdec <key> <name> <value>", "Decrypt the command line value")
        .command("test", "Test decrypted dotenv file")
        .example("$0 enc -f .env.*", "Encrypt the contents of the variables inside the dotenv file")
        .example("$0 dec -f .env.*", "Decrypt the contents of the variables inside the dotenv file")
        .example("$0 test -f .env.*", "Test the contents of the variables inside the dotenv file")
        .example(
            "$0 kdec CIPHERED__DEV__EMAIL_API=q6M1bArrP6vCQooz.ZUi7rAgMG+KrOOVJ1qKyYB7W/umPFKZTGZ5UIh5JBBGlRTluS2yr.CcggXA5pndStr4MjczcwDg==",
            "Decrypt the command line"
        )
        .example(
            "$0 kenc UNENCRYPTED__DEV__EMAIL_API=EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c",
            "Encrypt the command line"
        )
        .example(
            "$0 xdec DEV EMAIL_API FhdQgQOC6th8fmti.IBxk8vKOTR4nYHPhDEJVB8ql7EW4rkd/tTxbXREjuMPrsoE0cbxu.JOv1f+AODXEUOUoACmgAQg==",
            "Decrypt the command line"
        )
        .example(
            "$0 xenc DEV EMAIL_API EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c",
            "Encrypt the command line"
        )
        .option("file", { describe: "dotenv file", default: [".env"], alias: "f", array: true })
        .option("output", { describe: "Output folder", alias: "o", type: "string" })
        .option("jsonOutput", {
            describe: "Write the results to the file in JSON format",
            default: "dotenv_encrypt_log.json",
            alias: "jo",
        })
        .option("backupFolder", {
            describe: "Create a backup file in the specified folder.",
            default: ".",
            alias: "bf",
        })
        .option("backup", {
            describe: "create a backup file",
            default: true,
            alias: "b",
            type: "boolean",
        })
        // .option("verbose", {
        //     describe: "verbose output",
        //     default: false,
        //     alias: "v",
        //     type: "boolean",
        // })
        .option("useRelativePaths", {
            describe: "Use relative folder paths",
            default: false,
            alias: "relpath",
            type: "boolean",
        })
        .help("h")
        .alias("h", "help")
        .demandCommand()
        .recommendCommands()
        .strict()
        .epilog("copyright Carlos Klapp 2020")
        .exitProcess(true)
        .wrap(null);
    // .exitProcess(!isRunningJest)
    // .fail((_msg, _err, _yargs) => {
    //     debugger;
    //     commandLineParserError = true;
    // });

    const args = yarg.parse(argv);

    return { ...args, commandLineParserError };
};

// { a: number, b: string }
// Compensate for a bug in YARGS. Yargs is not including the options to
// the commands kenc, kdec, xenc, xdec. Force their inclusion in the definition.
export type ParsedArgsDataType = ReturnType<typeof parseArgs> & {
    keyvalue?: string;
    key?: string;
    name?: string;
    value?: string;
};
