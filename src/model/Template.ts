import { Request } from "express";
import * as FileUtil from "../util/FileUtil";

export class Template {
  public name: string;
  public icon: string;
  public files: string[];

  public async save(req: Request): Promise<void> {
    this.name = <string>req.fields.name;
    if (!name) {
      throw new Error("No name specified");
    }
    this.files = [];
    let folder = FileUtil.combine("resources", "templates", this.name);
    this.files = await FileUtil.saveFiles(req, folder);
  }
}