import { Request } from "express";
import * as ErrorUtil from "../util/ErrorUtil";
import * as FileUtil from "../util/FileUtil";

export default class Template {

     public name: string = "";
     public icon: string | undefined;
     public meta: string | undefined;
     public files: string[] = [];

     public async save(req: Request): Promise<void> {
          if (req.fields && req.fields.name) {
               this.name = req.fields.name as string;
          } else {
               throw ErrorUtil.MissingFieldError(req.fields, "name");
          }
          const folder = FileUtil.resource(FileUtil.templates, this.name);
          this.files = await FileUtil.saveFiles(req, folder);
     }

     public async load(...folder: string[]): Promise<void> {
          this.name = folder[folder.length - 1];
          this.icon = await this.getIcon(...folder);
          this.meta = await this.getMeta(...folder);
     }

     private async getIcon(...folder: string[]): Promise<string | undefined> {
          const svgFile = FileUtil.combine(...folder, "icon.svg");
          try {
               const buffer = await FileUtil.read(svgFile);
               const svg = buffer.toString("utf8");
               return svg;
          } catch {
               return undefined;
          }
     }

     private async getMeta(...folder: string[]): Promise<any | undefined> {
          const svgFile = FileUtil.combine(...folder, "meta.json");
          try {
               const buffer = await FileUtil.read(svgFile);
               const json = buffer.toString("utf8");
               const obj = JSON.parse(json);
               return obj;
          } catch (err) {
               return undefined;
          }
     }
}
