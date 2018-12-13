import { Request } from "express";
import * as path from "path";
import * as FileUtil from "../util/FileUtil";

export class Template {
  public name: string;
  public icon: string;
  public files: string[];

  public save(req: Request): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.name = <string>req.fields.name;
      this.files = [];
      let folder = path.join("resources", "templates", this.name);

      FileUtil.saveFiles(req, folder)
      .then(() => resolve())
      .catch(err => reject(err));
    });
  }
}