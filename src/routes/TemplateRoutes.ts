import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import { Template } from "../model/Template";
import * as FileUtil from "../util/FileUtil";

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
      .then(() => res.end())
      .catch(err => next(err));
    });
    this.router.delete("/:name", (req: Request, res: Response, next: NextFunction) => {
      let name = <string>req.fields.name;
      FileUtil.deleteDir(FileUtil.resources, FileUtil.templates, name)
      .then(() => res.end())
      .catch(err => next(err));
    });
  }

  private async getDirectories(): Promise<Template[]> {
    let folder = FileUtil.combine(process.cwd(), FileUtil.resources, FileUtil.templates);
    let stats = await FileUtil.readdirStats(folder);
    let templates: Template[] = [];
    for (let stat of stats) {
      if (stat[1].isDirectory()) {
        let temp = new Template();
        temp.name = stat[0];
        temp.icon = await this.getIcon(folder, temp.name);
        templates.push(temp);
      }
    }
    return templates;
  }

  private async getIcon(...folder: string[]): Promise<string> {
    let svgFile = FileUtil.combine(...folder, "icon.svg");
    try
    {
      let buffer = await FileUtil.read(svgFile);
      let svg = buffer.toString("utf8");
      return svg;
    }
    catch
    {
      return undefined;
    }
  }
}

export default new TemplateRoutes().router;