import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import { v4 as uuid } from "uuid";
import ConverterData from "../model/ConverterData";
import Pandoc from "../process/Pandoc";
import * as FileUtil from "../util/FileUtil";

class ConverterRoutes {

    public router: Router;

    private pandoc: Pandoc;

    public constructor() {
        this.router = Router();
        this.pandoc = Pandoc.getInstance();
        this.setupConverter();
    }

    private setupConverter() {
        this.router.post("/", async (req: Request, res: Response, next: NextFunction) => {
            const folder = FileUtil.resource(FileUtil.temporary, uuid());
            const data = new ConverterData();
            try {
                await data.save(req, folder);
                const buffer = await this.pandoc.convert(data, folder);
                if (data.isBinary()) {
                    res.type(data.to || "binary");
                    return res.end(buffer, "binary");
                } else {
                    return res.end(buffer.toString("utf-8"));
                }
            } catch (err) {
                return next(err);
            }
        });
    }
}

export default new ConverterRoutes().router;
