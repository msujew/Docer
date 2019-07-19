import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import ConverterData from "../model/ConverterData";
import Pandoc from "../process/Pandoc";
import * as FileUtil from "../util/FileUtil";

class ConverterRoutes {

    public router: Router;

    private pandoc: Pandoc;
    private count: number = 1;

    public constructor() {
        this.router = Router();
        this.pandoc = Pandoc.getInstance();
        this.setupConverter();
    }

    private setupConverter() {
        this.router.post("/", async (req: Request, res: Response, next: NextFunction) => {
            this.count %= 999;
            let folder = FileUtil.combine(FileUtil.resources, FileUtil.temporary,
                (this.count++).toString().padStart(3, "0"));
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