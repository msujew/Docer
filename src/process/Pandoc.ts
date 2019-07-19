import ConverterData from "../model/ConverterData";
import { spawn } from "child_process";
import * as FileUtil from "../util/FileUtil";
import * as ErrorUtil from "../util/ErrorUtil";

export default class Pandoc {

    public syntaxDefinitions: string[] = [];

    private static instance: Pandoc;

    private constructor() {
        this.syntaxDefinitions = [];
        for (let file of FileUtil.readdirSync(FileUtil.resources, FileUtil.syntaxDefinitions)) {
            if (file.endsWith(".xml")) {
                this.syntaxDefinitions.push(file);
            }
        }
    }

    public static getInstance() {
        Pandoc.instance = Pandoc.instance || new Pandoc();
        return Pandoc.instance;
    }

    public convert(data: ConverterData, folder: string): Promise<Buffer> {
        return new Promise<Buffer>(async (resolve, reject) => {
            let file = FileUtil.combine(folder, "result." + data.to);
            let args = ["-f", data.from, "--resource-path", folder, "--listings", "-V", `resources=${folder.split("\\").join("/")}`];
            this.setTemplate(data, args);
            this.setCsl(data, args);
            await this.setBibliography(folder, args);

            if (data.isPlainText()) {
                args.push("--wrap=none");
            }

            if (data.to === "pdf") args.push("-t", "latex");
            else args.push("-t", data.to);

            for (let syntaxDef of this.syntaxDefinitions) {
                args.push("--syntax-definition", FileUtil.combine(FileUtil.resources, FileUtil.syntaxDefinitions, syntaxDef));
            }

            args.push("-o", file);
            await this.findAllInputFiles(folder, data.extension, args);

            console.log(args);

            let output = ""
            let pandoc = spawn("pandoc", args);
            pandoc.stderr.on('data', data => {
                output = output + data
            })
            pandoc.on('close', code => {
                if (code !== 0) {
                    console.log("Pandoc Error: " + output)
                    reject(ErrorUtil.PandocFailedError);
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
        if (data.template &&
            data.template.length > 0) {
            args.push("--template", FileUtil.combine(FileUtil.resources, FileUtil.templates, data.template, "template"));
        } else {
            args.push("-s");
        }
    }

    private setCsl(data: ConverterData, args: string[]) {
        if (data.csl &&
            data.csl.length > 0) {
            args.push("--csl", FileUtil.combine(FileUtil.resources, FileUtil.csl, data.csl + ".csl"));
        }
    }

    private async setBibliography(directory: string, args: string[]) {
        for await (let file of FileUtil.readdirRecursiveFiltered(".bib", directory)) {
            args.push("--bibliography", file);
        }
    }

    private async findAllInputFiles(directory: string, extension: string | undefined, args: string[]) {
        if (extension) {
            for await (let file of FileUtil.readdirRecursiveFiltered(extension, directory)) {
                args.push(file);
            }
        } else {
            args.push(FileUtil.combine(directory, "content"));
        }
    }
}