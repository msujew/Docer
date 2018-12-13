import * as express from "express";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";
import * as formidable from "express-formidable";

import ConverterRoutes from "./routes/ConverterRoutes";
import TemplateRoutes from "./routes/TemplateRoutes";
import SyntaxDefinitionRoutes from "./routes/SyntaxDefinitionRoutes";
import { NextFunction } from "connect";
import * as FileUtil from "./util/FileUtil";

class App {

  public app: express.Application;
  
  constructor() {
    this.app = express();
    this.config();
    this.app.use("/convert", ConverterRoutes);
    this.app.use("/templates", TemplateRoutes);
    this.app.use("/syntax-definitions", SyntaxDefinitionRoutes);
  }

  private config() {
    // support application/json type post data
    this.app.use(morgan("dev"));
    //this.app.use(bodyParser.json({ limit: "100mb" }));
    //support application/x-www-form-urlencoded post data
    //this.app.use(bodyParser.urlencoded({ extended: false, limit: "100mb" }));
    FileUtil.deleteDirSync("resources/tmp");
    FileUtil.deleteDirSync("resources/uploads");
    setTimeout(() => FileUtil.mkdir("resources/uploads"), 100);
    FileUtil.mkdir("resources/templates");
    FileUtil.mkdir("resources/syntax-definition");
    this.app.use(formidable({ multiples: true, uploadDir: process.cwd() + "/resources/uploads" }));
    this.app.use((err: Error, 
                  _req: express.Request, 
                  res: express.Response, 
                  _next: NextFunction) => {
      res.json({ error: { message: err.message }});
    });
  }
}

export default new App().app;