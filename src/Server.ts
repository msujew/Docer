import app from "./App";
import { createConnection } from "typeorm";
import { UserWorkspace } from "./model/workspace/UserWorkspace";
import { UserWorkspaceItem } from "./model/workspace/UserWorkspaceItem";
const PORT = 3030;
const HOST = "0.0.0.0";

createConnection({
    type: "sqlite",
    database: "workspace.db",
    entities: [
        UserWorkspace,
        UserWorkspaceItem
    ],
    synchronize: true,
    logging: false
}).then(_connection => {
    console.log("Connected to Database");
    app.listen(PORT, HOST, () => {
        console.log('Express server listening on ' + HOST + ":" + PORT);
    });
}).catch(error => console.log(error));