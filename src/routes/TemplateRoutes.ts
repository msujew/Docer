import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import Template from "../model/Template";
import * as ErrorUtil from "../util/ErrorUtil";
import * as FileUtil from "../util/FileUtil";

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
        this.router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
            try {
                const templates = await this.getDirectories();
                return res.json(templates);
            } catch (err) {
                return next(err);
            }
        });
        this.router.get("/:name", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name) {
                try {
                    const name =  req.fields.name as string;
                    const buffer = FileUtil.read(FileUtil.resourcesDir(), FileUtil.templates, name, "meta.json");
                    res.type("application/json");
                    return res.end(buffer);
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(ErrorUtil.MissingFieldError(req.fields, "name"));
            }
        });
        this.router.post("/", async (req: Request, res: Response, next: NextFunction) => {
            const template = new Template();
            try {
                await template.save(req);
                return res.end();
            } catch (err) {
                return next(err);
            }
        });
        this.router.delete("/:name", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name) {
                try {
                    const name =  req.fields.name as string;
                    await FileUtil.deleteDir(FileUtil.resourcesDir(), FileUtil.templates, name);
                    return res.end();
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(ErrorUtil.MissingFieldError(req.fields, "name"));
            }
        });
    }

    private async getDirectories(): Promise<Template[]> {
        const stats = FileUtil.readdirStats(FileUtil.resourcesDir(), FileUtil.templates);
        const templates: Template[] = [];
        for await (const stat of stats) {
            if (stat[1].isDirectory()) {
                const temp = new Template();
                await temp.load(FileUtil.resourcesDir(), FileUtil.templates, stat[0]);
                templates.push(temp);
            }
        }
        return templates;
    }

}

export default new TemplateRoutes().router;
