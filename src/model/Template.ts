import { Request } from "express";
import * as FileUtil from "../util/FileUtil";
import * as ErrorUtil from "../util/ErrorUtil";

export class Template {

     public name: string = "";
     public icon: string | undefined;
     public files: string[] = [];

     public async save(req: Request): Promise<void> {
          if (req.fields && req.fields.name) {
               this.name = <string>req.fields.name;
          } else {
               throw ErrorUtil.MissingFieldError("name");
          }
          this.files = [];
          let folder = FileUtil.combine("resources", "templates", this.name);
          this.files = await FileUtil.saveFiles(req, folder);
     }

     public async load(...folder: string[]): Promise<void> {
          this.name = folder[folder.length - 1];
          this.icon = await this.getIcon(...folder);
     }

     private async getIcon(...folder: string[]): Promise<string | undefined> {
          let svgFile = FileUtil.combine(...folder, "icon.svg");
          try {
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