import * as express from "express";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";
import * as formidable from "express-formidable";

import ConverterRoutes from "./routes/ConverterRoutes";
import TemplateRoutes from "./routes/TemplateRoutes";
import SyntaxDefinitionRoutes from "./routes/SyntaxDefinitionRoutes";
import CslRoutes from "./routes/CslRoutes";
import { NextFunction } from "connect";
import * as FileUtil from "./util/FileUtil";

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
    //this.app.use(bodyParser.json({ limit: "100mb" }));
    //support application/x-www-form-urlencoded post data
    //this.app.use(bodyParser.urlencoded({ extended: false, limit: "100mb" }));
    FileUtil.deleteDirSync(FileUtil.resources, FileUtil.temporary);
    FileUtil.deleteDirSync(FileUtil.resources, FileUtil.uploads);
    FileUtil.mkdirSync(FileUtil.resources, FileUtil.templates);
    FileUtil.mkdirSync(FileUtil.resources, FileUtil.syntaxDefinitions);
    FileUtil.mkdirSync(FileUtil.resources, FileUtil.uploads);
    this.app.use(formidable(
      { 
        multiples: true, 
        uploadDir: FileUtil.combine(process.cwd(), FileUtil.resources, FileUtil.uploads) 
      })
    );
    this.app.use("/convert", ConverterRoutes);
    this.app.use("/templates", TemplateRoutes);
    this.app.use("/syntax-definitions", SyntaxDefinitionRoutes);
    this.app.use("/csl", CslRoutes);
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
      res.json({ error: { message: err.message }});
    });
  }
}

export default new App().app;