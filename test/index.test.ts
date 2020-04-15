import "jest-extended";
import { decryptProcessEnvironment } from "../src/index";
import dotenv from "dotenv";

describe("Test default behavior", () => {
    it("Decrypt process.env", () => {
        dotenv.config({ path: "test/env_test_files/.env.noerror" });
        decryptProcessEnvironment();

        expect(process.env["UNENCRYPTED__ALL__MONGODB_CONN_URI"]).toEqual(
            "mongodb://<mlab_user>:<mlab_password>@<mlab_connection_url_all>"
        );
        expect(process.env["UNENCRYPTED__ALL__SESSION_SECRET"]).toEqual("all session secret");
        expect(process.env["UNENCRYPTED__DEV__MONGODB_CONN_URI"]).toEqual(
            "mongodb://<mlab_user>:<mlab_password>@<mlab_connection_url_dev>"
        );
        expect(process.env["UNENCRYPTED__DEV__SESSION_SECRET"]).toEqual("dev session secret");
        expect(process.env["UNENCRYPTED__LOCAL__MONGODB_CONN_URI"]).toEqual(
            "mongodb://localhost:27017/<database_local>"
        );
        expect(process.env["UNENCRYPTED__LOCAL__SESSION_SECRET"]).toEqual("local session secret");
        expect(process.env["UNENCRYPTED__PROD__MONGODB_CONN_URI"]).toEqual(
            "mongodb://<mlab_user>:<mlab_password>@<mlab_connection_url_prod>"
        );
        expect(process.env["UNENCRYPTED__PROD__SESSION_SECRET"]).toEqual("prod session secret");
        expect(process.env["UNENCRYPTED__TEST__MONGODB_CONN_URI"]).toEqual(
            "mongodb://<mlab_user>:<mlab_password>@<mlab_connection_url_test>"
        );
        expect(process.env["UNENCRYPTED__TEST__SESSION_SECRET"]).toEqual("test session secret");
        expect(process.env["UNENCRYPTED__WILDCARD__MONGODB_CONN_URI"]).toEqual(
            "mongodb://<mlab_user>:<mlab_password>@<mlab_connection_url_test>"
        );
        expect(process.env["UNENCRYPTED__WILDCARD__SESSION_SECRET"]).toEqual("all session secret");
    });
});
