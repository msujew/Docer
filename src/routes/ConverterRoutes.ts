import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import ConverterData from "../model/ConverterData";
import Pandoc from "../process/Pandoc";
import * as FileUtil from "../util/FileUtil";
import { v4 as uuid } from "uuid";

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
            let folder = FileUtil.combine(FileUtil.resources, FileUtil.temporary, uuid());
            let data = new ConverterData();
            try {
                await data.save(req, folder);
                let buffer = await this.pandoc.convert(data, folder);
                if (data.isBinary()) {
                    res.type(data.to || "binary");
                    res.end(buffer, 'binary');
                } else {
                    res.send(buffer.toString("utf-8"));
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
}

export default new ConverterRoutes().router;