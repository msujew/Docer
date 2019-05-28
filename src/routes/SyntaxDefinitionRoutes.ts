import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import * as FileUtil from "../util/FileUtil";
import * as ErrorUtil from "../util/ErrorUtil";

class SyntaxDefinitionRoutes {

    public router = Router();

    private folder = FileUtil.combine(FileUtil.resources, FileUtil.syntaxDefinitions);

    public constructor() {
        this.router = Router();
        this.setup();
    }

    private setup() {
        this.router.param("name", (req: Request, _res: Response, next: NextFunction, name: string) => {
            if (req.fields) {
                req.fields.name = name;
            }
            next();
        });
        this.router.get("/", (_req: Request, res: Response, next: NextFunction) => {
            this.getFiles()
                .then(files => res.json(files))
                .catch(err => next(err));
        });
        this.router.get("/:name", (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name) {
                let file = <string>req.fields.name;
                FileUtil.read(this.folder, file)
                    .then(buffer => {
                        res.type("xml");
                        res.send(buffer.toString("utf8"));
                    }).catch(err => next(err));
            } else {
                next(ErrorUtil.MissingFieldError("name"));
            }
        });
        this.router.post("/", (req: Request, res: Response, next: NextFunction) => {
            FileUtil.saveFiles(req, this.folder)
                .then(() => res.end())
                .catch(err => next(err));
        });
        this.router.delete("/:name", (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name) {
                let name = <string>req.fields.name;
                FileUtil.deleteDir(this.folder, name)
                    .then(() => res.end())
                    .catch(err => next(err));
            }
            else {
                next(ErrorUtil.MissingFieldError("name"));
            }
        });
    }

    private async getFiles(): Promise<string[]> {
        let stats = FileUtil.readdirStats(this.folder);
        let definitions: string[] = [];
        for await (let stat of stats) {
            let name = stat[0];
            let file = stat[1];
            if (file.isFile() && name.endsWith(".xml")) {
                name = name.substring(0, name.indexOf(".xml"));
                definitions.push(name);
            }
        }
        return definitions;
    }
}

export default new SyntaxDefinitionRoutes().router;