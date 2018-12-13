import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import { Template } from "../model/Template";
import * as FileUtil from "../util/FileUtil";
import * as path from "path";

class TemplateRoutes {

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
      this.getDirectories()
        .then(templates => res.json(templates))
        .catch(err => next(err));
    });
    this.router.get("/:name", (_req: Request, _res: Response, next: NextFunction) => {
      next(new Error("Not implemented"));
    });
    this.router.post("/", (req: Request, res: Response, next: NextFunction) => {
      let template = new Template();
      template.save(req)
      .then(() => res.send("Successfully saved"))
      .catch(err => next(err));
    });
    this.router.delete("/:name", (req: Request, res: Response, next: NextFunction) => {
      let name = <string>req.fields.name;
      FileUtil.deleteDir(path.join("resources", "templates", name))
      .then(() => res.send("Successfully deleted"))
      .catch(err => next(err));
    });
  }

  private getDirectories(): Promise<Template[]> {
    let folder = path.join(process.cwd(), "resources", "templates");
    return new Promise<Template[]>((resolve, reject) => {
      FileUtil.readdirStats(folder)
      .then(stats => {
        let templates: Template[] = [];
        for (let stat of stats) {
          if (stat[1].isDirectory()) {
            let temp = new Template();
            temp.name = stat[0];
            templates.push(temp);
          }
        }
        resolve(templates);
      }).catch(err => reject(err));
    });
  }
}

export default new TemplateRoutes().router;