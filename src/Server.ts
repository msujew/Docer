import { createConnection } from "typeorm";
import app from "./App";
import User from "./model/workspace/User";
import UserSession from "./model/workspace/UserSession";
import UserWorkspace from "./model/workspace/UserWorkspace";
import UserWorkspaceItem from "./model/workspace/UserWorkspaceItem";

import * as FileUtil from "./util/FileUtil";

const PORT = Number(process.env.port) || 3030;
const HOST = process.env.host || "0.0.0.0";

async function run() {
    try {
        await createConnection({
            database: FileUtil.resource("workspace.db"),
            entities: [
                User,
                UserSession,
                UserWorkspace,
                UserWorkspaceItem
            ],
            logging: false,
            type: "sqlite"
        });
        console.log("Connected to Database");
        app.listen(PORT, HOST, () => {
            console.log(`Express server listening on ${HOST}:${PORT}`);
        });
    } catch (err) {
        console.error("Error starting server: " + err.message);
    }
}

try {
    run();
} catch (err) {
    console.log(err);
}
