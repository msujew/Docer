import { ConverterData } from "../model/ConverterData";
import { spawn } from "child_process";
import * as path from "path";
import * as FileUtil from "../util/FileUtil";

export class Pandoc {

  public syntaxDefinitions: string[] = [];

  private static instance: Pandoc;

  private constructor() {
    this.syntaxDefinitions = [];
    FileUtil.readdir(path.join("resources", "syntax-definition"))
    .then(files => {
      for (let file of files) {
        if (file.endsWith(".xml")) {
          this.syntaxDefinitions.push(file);
        }
      }
    });
  }

  public static getInstance() {
    Pandoc.instance = Pandoc.instance || new Pandoc();
    return Pandoc.instance;
  }

  public convert(data: ConverterData, folder: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      let content = path.join(folder, "content");
      let file = path.join(folder, "result." + data.to);
      let args = [ "-s", "-f", data.from, "--resource-path", folder, "--listings" ];
      this.setTemplate(data, args);

      if (data.to === "pdf") args.push("-t", "latex");
      else args.push("-t", data.to);

      for (let syntaxDef of this.syntaxDefinitions) {
        args.push("--syntax-definition", path.join("resources", "syntax-definition", syntaxDef));
      }

      args.push("-o", file);
      args.push(content);
      
      let pandoc = spawn("pandoc", args);
      pandoc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error("Pandoc finished unexpectedly"));
        } else {
          FileUtil.read(file).then(buffer => {
            FileUtil.deleteDir(folder);
            resolve(buffer);
          }).catch(err => {
            reject(err);
          });
        }
      });
    });
  }

  private setTemplate(data: ConverterData, args: string[]) {
    if (data.template !== undefined && 
        data.template != null &&
        data.template.length > 0) {
      args.push("--template", "resources/templates/" + data.template + "/template");
    }
  }
}