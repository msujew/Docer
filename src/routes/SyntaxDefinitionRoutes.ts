import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import * as FileUtil from "../util/FileUtil";
import * as path from "path";

class SyntaxDefinitionRoutes {

  public router = Router();

  public constructor() {
    this.router = Router();
    this.setup();
  }

  private setup() {
    this.router.param("name", (req: Request, _res: Response, next: NextFunction, name: string) => {
      req.fields.name = name;
      next();
    });
    this.router.get("/", (_req: Request, res: Response, next: NextFunction) => {
      this.getFiles()
        .then(files => res.json(files))
        .catch(err => next(err));
    });
    this.router.get("/:name", (req: Request, res: Response, next: NextFunction) => {
      let file = <string>req.fields.name;
      FileUtil.read(path.join("resources", "syntax-definition", file))
      .then(buffer => {
        res.type("xml");
        res.send(buffer.toString("utf-8"));
      }).catch(err => next(err));
    });
    this.router.post("/", (req: Request, res: Response, next: NextFunction) => {
      next(new Error("Not implemented"));
      let folder = path.join("resources", "syntax-definition");
      FileUtil.saveFiles(req, folder)
      .then(() => res.end())
      .catch(err => next(err));
    });
    this.router.delete("/:name", (req: Request, res: Response, next: NextFunction) => {
      // let name = <string>req.fields.name;
      // FileUtil.deleteDir(path.join("resources", "templates", name))
      // .then(() => res.send("Successfully deleted"))
      // .catch(err => next(err));
      next(new Error("Not implemented"));
    });
  }

  private getFiles(): Promise<string[]> {
    let folder = path.join(process.cwd(), "resources", "syntax-definition");
    return new Promise<string[]>((resolve, reject) => {
      FileUtil.readdirStats(folder)
      .then(stats => {
        let definitions: string[] = [];
        for (let stat of stats) {
          let name = stat[0];
          let file = stat[1];
          if (file.isFile() && name.endsWith(".xml")) {
            name = name.substring(0, name.indexOf(".xml"));
            definitions.push(name);
          }
        }
        resolve(definitions);
      }).catch(err => reject(err));
    });
  }
}

export default new SyntaxDefinitionRoutes().router;