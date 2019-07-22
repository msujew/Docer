import app from "./App";
import { createConnection } from "typeorm";
import User from "./model/workspace/User";
import UserWorkspace from "./model/workspace/UserWorkspace";
import UserWorkspaceItem from "./model/workspace/UserWorkspaceItem";
import UserSession from "./model/workspace/UserSession";
import * as FileUtil from "./util/FileUtil";
const PORT = 3030;
const HOST = "0.0.0.0";

async function run() {
    await createConnection({
        type: "sqlite",
        database: FileUtil.combine(FileUtil.resourcesDir(), "workspace.db"),
        entities: [
            User,
            UserSession,
            UserWorkspace,
            UserWorkspaceItem
        ],
        synchronize: true,
        logging: false
    });
    console.log("Connected to Database");
    app.listen(PORT, HOST, () => {
        console.log('Express server listening on ' + HOST + ":" + PORT);
    });
}

try {
    run();
} catch (err) {
    console.log(err);
}