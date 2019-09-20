import * as connect from "connect";
import { Request, Response, Router } from "express";
import User from "../model/workspace/User";
import UserSession from "../model/workspace/UserSession";
import * as FileUtil from "../util/FileUtil";

class SchemaRoutes {

    public router: Router;

    public constructor() {
        this.router = Router();
        this.setupSchema();
    }

    private setupSchema() {
        this.router.get("/", async (_req: Request, res: Response, next: connect.NextFunction) => {
            try {
                const templates = await this.getTemplates();
                const csls = await this.getCsls();
                const schemaBuffer = await FileUtil.read(FileUtil.resourcesDir(), "schema.json");
                const schemaText = schemaBuffer.toString("utf8");
                const schemaJson = JSON.parse(schemaText);
                schemaJson.properties.template.enum = templates;
                schemaJson.properties.csl.enum = csls;
                res.json(schemaJson);
            } catch (err) {
                next(err);
            }
        });
    }

    private async getTemplates(): Promise<Array<string | null>> {
        const stats = FileUtil.readdirStats(FileUtil.resourcesDir(), FileUtil.templates);
        const templates: Array<string | null> = [];
        templates.push(null);
        for await (const stat of stats) {
            if (stat[1].isDirectory()) {
                templates.push(stat[0]);
            }
        }
        return templates;
    }

    private async getCsls(): Promise<Array<string | null>> {
        const stats = FileUtil.readdirStats(FileUtil.resourcesDir(), FileUtil.csl);
        const csls: Array<string | null> = [];
        csls.push(null);
        for await (const stat of stats) {
            if (stat[1].isFile()) {
                const fileName = stat[0].substring(0, stat[0].indexOf("."));
                csls.push(fileName);
            }
        }
        return csls;
    }
}

export default new SchemaRoutes().router;
