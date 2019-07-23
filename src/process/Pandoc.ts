import { spawn } from "child_process";
import ConverterData from "../model/ConverterData";
import * as ErrorUtil from "../util/ErrorUtil";
import * as FileUtil from "../util/FileUtil";

export default class Pandoc {

    public static getInstance() {
        return Pandoc.instance;
    }

    private static instance: Pandoc = new Pandoc();

    public syntaxDefinitions: string[] = [];

    private constructor() {
        this.syntaxDefinitions = [];
        for (const file of FileUtil.readdirSync(FileUtil.resourcesDir(), FileUtil.syntaxDefinitions)) {
            if (file.endsWith(".xml")) {
                this.syntaxDefinitions.push(file);
            }
        }
    }

    public convert(data: ConverterData, folder: string): Promise<Buffer> {
        return new Promise<Buffer>(async (resolve, reject) => {
            const file = FileUtil.combine(folder, "result." + data.to);
            const args = [
                "-f",
                data.from,
                "--resource-path",
                folder,
                "--listings",
                "-V",
                `resources=${folder.split("\\").join("/")}`
            ];
            this.setTemplate(data, args);
            this.setCsl(data, args);
            await this.setBibliography(folder, args);

            if (data.isPlainText()) {
                args.push("--wrap=none");
            }

            if (data.to === "pdf") { args.push("-t", "latex"); } else { args.push("-t", data.to); }

            for (const syntaxDef of this.syntaxDefinitions) {
                args.push("--syntax-definition", FileUtil.resource(FileUtil.syntaxDefinitions, syntaxDef));
            }

            args.push("-o", file);
            await this.findAllInputFiles(folder, data.extension, args);

            console.log(args);

            let output = "";
            const pandoc = spawn("pandoc", args);
            pandoc.stderr.on("data", (err) => {
                output = output + err;
            });
            pandoc.on("close", async (code) => {
                if (code !== 0) {
                    console.log("Pandoc Error: " + output);
                    reject(ErrorUtil.PandocFailedError);
                } else {
                    try {
                        const buffer = await FileUtil.read(file);
                        await FileUtil.deleteDir(folder);
                        resolve(buffer);
                    } catch (err) {
                        reject(err);
                    }
                }
            });
        });
    }

    private setTemplate(data: ConverterData, args: string[]) {
        if (data.template &&
            data.template.length > 0) {
            args.push("--template", FileUtil.resource(FileUtil.templates, data.template, "template"));
        } else {
            args.push("-s");
        }
    }

    private setCsl(data: ConverterData, args: string[]) {
        if (data.csl &&
            data.csl.length > 0) {
            args.push("--csl", FileUtil.resource(FileUtil.csl, data.csl + ".csl"));
        }
    }

    private async setBibliography(directory: string, args: string[]) {
        for await (const file of FileUtil.readdirRecursiveFiltered(".bib", directory)) {
            args.push("--bibliography", file);
        }
    }

    private async findAllInputFiles(directory: string, extension: string | undefined, args: string[]) {
        if (extension) {
            for await (const file of FileUtil.readdirRecursiveFiltered(extension, directory)) {
                args.push(file);
            }
        } else {
            args.push(FileUtil.combine(directory, "content"));
        }
    }
}
