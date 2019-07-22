import * as express from "express";
import * as morgan from "morgan";
import * as formidable from "express-formidable";

import ConverterRoutes from "./routes/ConverterRoutes";
import TemplateRoutes from "./routes/TemplateRoutes";
import SyntaxDefinitionRoutes from "./routes/SyntaxDefinitionRoutes";
import CslRoutes from "./routes/CslRoutes";
import { NextFunction } from "connect";
import * as FileUtil from "./util/FileUtil";
import WorkspaceRoutes from "./routes/WorkspaceRoutes";
import RegisterRoutes from "./routes/RegisterRoutes";
import LoginRoutes from "./routes/LoginRoutes";

declare global {
    interface Error {
        /** Appended http status */
        status?: number;
    }
}

class App {

    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    private config() {
        // support application/json type post data
        this.app.use(morgan("dev"));
        FileUtil.deleteDirSync(FileUtil.resourcesDir(), FileUtil.temporary);
        FileUtil.deleteDirSync(FileUtil.resourcesDir(), FileUtil.uploads);
        FileUtil.mkdirSync(FileUtil.resourcesDir(), FileUtil.templates);
        FileUtil.mkdirSync(FileUtil.resourcesDir(), FileUtil.syntaxDefinitions);
        FileUtil.mkdirSync(FileUtil.resourcesDir(), FileUtil.uploads);
        this.app.use(formidable(
            {
                multiples: true,
                uploadDir: FileUtil.combine(FileUtil.resourcesDir(), FileUtil.uploads)
            })
        );
        this.app.use("/login",  LoginRoutes);
        this.app.use("/convert", ConverterRoutes);
        this.app.use("/templates", TemplateRoutes);
        this.app.use("/syntax-definitions", SyntaxDefinitionRoutes);
        this.app.use("/csl", CslRoutes);
        this.app.use("/workspace", WorkspaceRoutes);
        this.app.use("/register", RegisterRoutes);
        this.app.use((req, res, next) => {
            if (req.path.match(/^\/?$/)) {
                res.end();
            } else {
                let err = new Error('Not Found');
                err.status = 404;
                next(err);
            }
        });
        this.app.use((err: Error,
            _req: express.Request,
            res: express.Response,
            _next: NextFunction) => {
            console.log(err);
            res.status(err.status || 500);
            res.json({ error: { message: err.message } });
        });
    }
}

export default new App().app;