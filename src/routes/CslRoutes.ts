import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import * as ErrorUtil from "../util/ErrorUtil";
import * as FileUtil from "../util/FileUtil";

class CslRoutes {

    public router = Router();

    private folder = FileUtil.resource(FileUtil.csl);

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
                const files = await this.getFiles();
                return res.json(files);
            } catch (err) {
                return next(err);
            }
        });
        this.router.get("/:name", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name) {
                try {
                    const file =  req.fields.name as string;
                    const buffer = await FileUtil.read(this.folder, file);
                    res.type("xml");
                    return res.send(buffer.toString("utf8"));
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(ErrorUtil.MissingFieldError(req.fields, "name"));
            }
        });
        this.router.post("/", async (req: Request, res: Response, next: NextFunction) => {
            try {
                await FileUtil.saveFiles(req, this.folder);
                return res.end();
            } catch (err) {
                return next(err);
            }
        });
        this.router.delete("/:name", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name) {
                try {
                    const name =  req.fields.name as string;
                    await FileUtil.deleteDir(this.folder, name);
                    return res.end();
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(ErrorUtil.MissingFieldError(req.fields, "name"));
            }
        });
    }

    private async getFiles(): Promise<string[]> {
        const stats = FileUtil.readdirStats(this.folder);
        const definitions: string[] = [];
        for await (const stat of stats) {
            let name = stat[0];
            const file = stat[1];
            if (file.isFile() && name.endsWith(".csl")) {
                name = name.substring(0, name.indexOf(".csl"));
                definitions.push(name);
            }
        }
        return definitions;
    }
}

export default new CslRoutes().router;
