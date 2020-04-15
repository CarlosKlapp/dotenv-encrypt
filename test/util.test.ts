import * as util from "../src/util";
import "jest-extended";

describe("Test utility functions", () => {
    it("replaceFilePath", () => {
        // ****************************************************************
        expect(util.replaceFilePath("", "..")).toEqual("../defaultFileName");
        expect(util.replaceFilePath("..", "..")).toEqual("../defaultFileName");
        expect(util.replaceFilePath("..", "")).toEqual("defaultFileName");
        expect(util.replaceFilePath("", "../foo/")).toEqual("../foo/defaultFileName");
        expect(util.replaceFilePath("..", "../foo/")).toEqual("../foo/defaultFileName");
        expect(util.replaceFilePath("..", "")).toEqual("defaultFileName");
        expect(util.replaceFilePath("", "/")).toEqual("/defaultFileName");
        expect(util.replaceFilePath("", ".")).toEqual("defaultFileName");
        expect(util.replaceFilePath(".", ".")).toEqual("defaultFileName");
        expect(util.replaceFilePath("", "")).toEqual("defaultFileName");
        expect(util.replaceFilePath("/", "")).toEqual("defaultFileName");
        expect(util.replaceFilePath("/", "/")).toEqual("/defaultFileName");
        expect(util.replaceFilePath("/foo", "/")).toEqual("/foo");
        expect(util.replaceFilePath("/foo.foo.foo", "/")).toEqual("/foo.foo.foo");
        expect(util.replaceFilePath("/", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/", "/bar/")).toEqual("/bar/defaultFileName");
        expect(util.replaceFilePath("/foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/foo", "/bar/")).toEqual("/bar/foo");
        expect(util.replaceFilePath("/foo.foo.foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/foo.foo.foo", "/bar/")).toEqual("/bar/foo.foo.foo");
        expect(util.replaceFilePath("/sub1/sub2/foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/sub1/sub2/foo", "/bar/")).toEqual("/bar/foo");
        expect(util.replaceFilePath("/sub1/sub2/foo.foo.foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/sub1/sub2/foo.foo.foo", "/bar/")).toEqual("/bar/foo.foo.foo");
        expect(util.replaceFilePath("/sub1/sub2/foo.foo.foo", "/bart/simpson/")).toEqual(
            "/bart/simpson/foo.foo.foo"
        );
        expect(util.replaceFilePath("/sub1/sub2/foo.foo.foo", "/bart/simpson/foo.foo.foo")).toEqual(
            "/bart/simpson/foo.foo.foo"
        );

        // ****************************************************************
        expect(util.replaceFilePath("/", "/.")).toEqual("/defaultFileName");
        expect(util.replaceFilePath("/foo", "/.")).toEqual("/foo");
        expect(util.replaceFilePath("/foo.foo.foo", "/.")).toEqual("/foo.foo.foo");
        expect(util.replaceFilePath("/", "/.bar")).toEqual("/.bar");
        expect(util.replaceFilePath("/", "/.bar/")).toEqual("/.bar/defaultFileName");
        expect(util.replaceFilePath("/foo", "/.bar")).toEqual("/.bar");
        expect(util.replaceFilePath("/foo", "/.bar/")).toEqual("/.bar/foo");
        expect(util.replaceFilePath("/foo", "/.bar/.")).toEqual("/.bar/foo");
        expect(util.replaceFilePath("/foo.foo.foo", "/.bar")).toEqual("/.bar");
        expect(util.replaceFilePath("/foo.foo.foo", "/.bar/")).toEqual("/.bar/foo.foo.foo");
        expect(util.replaceFilePath("/foo.foo.foo", "/.bar/.")).toEqual("/.bar/foo.foo.foo");
        expect(util.replaceFilePath("/sub1/sub2/foo", "/.bar")).toEqual("/.bar");
        expect(util.replaceFilePath("/sub1/sub2/foo", "/.bar/")).toEqual("/.bar/foo");
        expect(util.replaceFilePath("/sub1/sub2/foo.foo.foo", "/.bar.")).toEqual("/.bar.");
        expect(util.replaceFilePath("/sub1/sub2/foo.foo.foo", "/.bar./.")).toEqual(
            "/.bar./foo.foo.foo"
        );
        expect(util.replaceFilePath("/sub1/sub2/foo.foo.foo", "/bart/.simpson/")).toEqual(
            "/bart/.simpson/foo.foo.foo"
        );
        expect(
            util.replaceFilePath("/sub1/sub2/foo.foo.foo", "/bart/.simpson/.foo.foo.foo")
        ).toEqual("/bart/.simpson/.foo.foo.foo");

        // ****************************************************************
        expect(util.replaceFilePath("./", "/")).toEqual("/defaultFileName");
        expect(util.replaceFilePath("./foo", "/")).toEqual("/foo");
        expect(util.replaceFilePath("./foo.foo.foo", "/")).toEqual("/foo.foo.foo");
        expect(util.replaceFilePath("./", "./")).toEqual("defaultFileName");
        expect(util.replaceFilePath("./", "./bar")).toEqual("bar");
        expect(util.replaceFilePath("./", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("./", "/bar/")).toEqual("/bar/defaultFileName");
        expect(util.replaceFilePath("./foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("./foo", "/bar/")).toEqual("/bar/foo");
        expect(util.replaceFilePath("./foo.foo.foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("./foo.foo.foo", "/bar/")).toEqual("/bar/foo.foo.foo");
        expect(util.replaceFilePath("./sub1/sub2/foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("./sub1/sub2/foo", "/bar/")).toEqual("/bar/foo");
        expect(util.replaceFilePath("./sub1/sub2/foo.foo.foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("./sub1/sub2/foo.foo.foo", "/bar/")).toEqual(
            "/bar/foo.foo.foo"
        );
        expect(util.replaceFilePath("./sub1/sub2/foo.foo.foo", "/bart/simpson/")).toEqual(
            "/bart/simpson/foo.foo.foo"
        );
        expect(
            util.replaceFilePath("./sub1/sub2/foo.foo.foo", "/bart/simpson/foo.foo.foo")
        ).toEqual("/bart/simpson/foo.foo.foo");

        // ****************************************************************
        expect(util.replaceFilePath("/.", "/")).toEqual("/defaultFileName");
        expect(util.replaceFilePath("/.foo", "/")).toEqual("/.foo");
        expect(util.replaceFilePath("/.foo.foo.foo", "/")).toEqual("/.foo.foo.foo");
        expect(util.replaceFilePath("/.", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/.", "/bar/")).toEqual("/bar/defaultFileName");
        expect(util.replaceFilePath("/.foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/.foo", "/bar/")).toEqual("/bar/.foo");
        expect(util.replaceFilePath("/.foo.foo.foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/.foo.foo.foo", "/bar/")).toEqual("/bar/.foo.foo.foo");
        expect(util.replaceFilePath("/.sub1/sub2/foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/.sub1/sub2/foo", "/bar/")).toEqual("/bar/foo");
        expect(util.replaceFilePath("/.sub1/sub2/foo.foo.foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/.sub1/sub2/foo.foo.foo", "/bar/")).toEqual(
            "/bar/foo.foo.foo"
        );
        expect(util.replaceFilePath("/.sub1/sub2/foo.foo.foo", "/bart/simpson/")).toEqual(
            "/bart/simpson/foo.foo.foo"
        );
        expect(
            util.replaceFilePath("/.sub1/sub2/foo.foo.foo", "/bart/simpson/foo.foo.foo")
        ).toEqual("/bart/simpson/foo.foo.foo");
        expect(util.replaceFilePath("/.sub1/sub2/.foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/.sub1/sub2/.foo", "/.bar")).toEqual("/.bar");
        expect(util.replaceFilePath("/.sub1/sub2/.foo", "/bar/")).toEqual("/bar/.foo");
        expect(util.replaceFilePath("/.sub1/sub2/.foo.foo.foo", "/bar")).toEqual("/bar");
        expect(util.replaceFilePath("/.sub1/sub2/.foo.foo.foo", "/bar/")).toEqual(
            "/bar/.foo.foo.foo"
        );
        expect(util.replaceFilePath("/.sub1/sub2/.foo.foo.foo", "/bart/simpson/")).toEqual(
            "/bart/simpson/.foo.foo.foo"
        );
        expect(
            util.replaceFilePath("/.sub1/sub2/.foo.foo.foo", "/bart/simpson/foo.foo.foo")
        ).toEqual("/bart/simpson/foo.foo.foo");
    });

    it("createBackupFilePath", () => {
        expect(
            util.createBackupFilePath("/sub1/sub2/foo.foo.foo", "/bart/simpson/foo.foo.foo.bak")
        ).toEqual("/bart/simpson/foo.foo.foo.bak");
        expect(util.createBackupFilePath("", "")).toEqual("defaultFileName.bak");
        expect(util.createBackupFilePath("", ".")).toEqual("defaultFileName.bak");
        expect(util.createBackupFilePath(".", "/")).toEqual("/defaultFileName.bak");
        expect(util.createBackupFilePath(".", ".")).toEqual("defaultFileName.bak");
        expect(util.createBackupFilePath("/", "/")).toEqual("/defaultFileName.bak");
        expect(util.createBackupFilePath("/foo", "/")).toEqual("/foo.bak");
        expect(util.createBackupFilePath("/foo.foo.foo", "/")).toEqual("/foo.foo.foo.bak");
        expect(util.createBackupFilePath("/", "/bar")).toEqual("/bar.bak");
        expect(util.createBackupFilePath("/", "/bar/")).toEqual("/bar/defaultFileName.bak");
        expect(util.createBackupFilePath("/foo", "/bar")).toEqual("/bar.bak");
        expect(util.createBackupFilePath("/foo", "/bar/")).toEqual("/bar/foo.bak");
        expect(util.createBackupFilePath("/foo.foo.foo", "/bar")).toEqual("/bar.bak");
        expect(util.createBackupFilePath("/foo.foo.foo", "/bar/")).toEqual("/bar/foo.foo.foo.bak");
        expect(util.createBackupFilePath("/sub1/sub2/foo", "/bar")).toEqual("/bar.bak");
        expect(util.createBackupFilePath("/sub1/sub2/foo", "/bar/")).toEqual("/bar/foo.bak");
        expect(util.createBackupFilePath("/sub1/sub2/foo.foo.foo", "/bar")).toEqual("/bar.bak");
        expect(util.createBackupFilePath("/sub1/sub2/foo.foo.foo", "/bar/")).toEqual(
            "/bar/foo.foo.foo.bak"
        );
        expect(util.createBackupFilePath("/sub1/sub2/foo.foo.foo", "/bart/simpson/")).toEqual(
            "/bart/simpson/foo.foo.foo.bak"
        );
        expect(
            util.createBackupFilePath("/sub1/sub2/foo.foo.foo", "/bart/simpson/foo.foo.foo")
        ).toEqual("/bart/simpson/foo.foo.foo.bak");
    });

    it("fileGlob", () => {
        util.fileGlob(["./test/env_test_files/.env."]).forEach(x =>
            expect(
                x.endsWith("/dotenv_encrypt/test/src/.env.mixed") ||
                    x.endsWith("/dotenv_encrypt/test/src/.env.noerror")
            ).toBeTrue()
        );
    });

    it("sortObjectByKeys", () => {
        const test = {
            z: "z foo",
            x: "x",
            y: [3, 2, 1],
            k: {
                z: "z nested",
                g: "g",
                a: "a",
                b: {
                    i: "i",
                    v: "v",
                    c: "c",
                },
            },
        };
        const expected = {
            k: {
                a: "a",
                b: {
                    c: "c",
                    i: "i",
                    v: "v",
                },
                g: "g",
                z: "z nested",
            },
            x: "x",
            y: [3, 2, 1],
            z: "z foo",
        };
        // console.log(JSON.stringify(util.sortObjectByKeys(test), null, "\t"));

        expect(JSON.stringify(util.sortObjectByKeys(test), null, "\t")).toEqual(
            JSON.stringify(expected, null, "\t")
        );
    });

    it("loadBufferFromFile", () => {
        const msg = "foobar";
        const buffer = Buffer.from(msg, "ascii");
        const text = util.loadBufferFromFile(buffer);
        expect(msg).toEqual(text);
    });
});
