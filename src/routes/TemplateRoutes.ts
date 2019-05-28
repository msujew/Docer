import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import { Template } from "../model/Template";
import * as FileUtil from "../util/FileUtil";
import * as ErrorUtil from "../util/ErrorUtil";

class TemplateRoutes {

    public router = Router();

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
            this.getDirectories()
                .then(templates => res.json(templates))
                .catch(err => next(err));
        });
        this.router.get("/:name", (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name) {
                let name = <string>req.fields.name
                FileUtil.read(FileUtil.resources, FileUtil.templates, name, "meta.json")
                    .then(buffer => {
                        res.type("application/json")
                        res.send(buffer);
                    })
                    .catch(err => next(err));
            } else {
                next(ErrorUtil.MissingFieldError("name"));
            }
        });
        this.router.post("/", (req: Request, res: Response, next: NextFunction) => {
            let template = new Template();
            template.save(req)
                .then(() => res.end())
                .catch(err => next(err));
        });
        this.router.delete("/:name", (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name) {
                let name = <string>req.fields.name;
                FileUtil.deleteDir(FileUtil.resources, FileUtil.templates, name)
                    .then(() => res.end())
                    .catch(err => next(err));
            } else {
                next(ErrorUtil.MissingFieldError("name"));
            }
        });
    }

    private async getDirectories(): Promise<Template[]> {
        let stats = FileUtil.readdirStats(FileUtil.resources, FileUtil.templates);
        let templates: Template[] = [];
        for await (let stat of stats) {
            if (stat[1].isDirectory()) {
                let temp = new Template();
                await temp.load(FileUtil.resources, FileUtil.templates, stat[0]);
                templates.push(temp);
            }
        }
        return templates;
    }


}

export default new TemplateRoutes().router;