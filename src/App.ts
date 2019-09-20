import { NextFunction } from "connect";
import * as express from "express";
import * as formidable from "express-formidable";
import * as morgan from "morgan";
import { PandocError } from "./process/PandocError";
import ConverterRoutes from "./routes/ConverterRoutes";
import CslRoutes from "./routes/CslRoutes";
import LoginRoutes from "./routes/LoginRoutes";
import RegisterRoutes from "./routes/RegisterRoutes";
import SyntaxDefinitionRoutes from "./routes/SyntaxDefinitionRoutes";
import TemplateRoutes from "./routes/TemplateRoutes";
import WorkspaceRoutes from "./routes/WorkspaceRoutes";
import * as FileUtil from "./util/FileUtil";

declare global {
    // tslint:disable-next-line: interface-name
    interface Error {
        status?: number;
        appCode?: number;
    }
}

class App {

    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    private config() {
        this.app.use(morgan("dev"));
        FileUtil.deleteDirSync(FileUtil.resourcesDir(), FileUtil.temporary);
        FileUtil.deleteDirSync(FileUtil.resourcesDir(), FileUtil.uploads);
        FileUtil.mkdirSync(FileUtil.resourcesDir(), FileUtil.templates);
        FileUtil.mkdirSync(FileUtil.resourcesDir(), FileUtil.syntaxDefinitions);
        FileUtil.mkdirSync(FileUtil.resourcesDir(), FileUtil.uploads);
        this.app.use(formidable({
            multiples: true,
            uploadDir: FileUtil.resource(FileUtil.uploads)
        }));
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
                const err = new Error("Not Found");
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
            if (err.name === "PandocError") {
                const pandocErr = err as PandocError;
                res.json({ error: { message: err.message, pandoc: pandocErr.pandoc, code: err.appCode } });
            } else {
                res.json({ error: { message: err.message, code: err.appCode } });
            }
        });
    }
}

export default new App().app;
