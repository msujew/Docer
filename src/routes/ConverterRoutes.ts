import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import { ConverterData } from "../model/ConverterData";
import { Pandoc } from "../process/Pandoc";
import * as path from "path";

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
    this.router.post("/", (req: Request, res: Response, next: NextFunction) => {
      this.count %= 999;
      let folder = path.join("resources", "tmp", (this.count++).toString().padStart(3, "0"));
      let data = new ConverterData();
      data.save(req, folder)
      .then(() => {
        this.pandoc.convert(data, folder)
        .then(buffer => {
          if (data.isBinary()) {
            res.type(data.to);
            res.end(buffer, 'binary');
          } else {
            res.send(buffer.toString("utf-8"));
          }
        }).catch((error) => {
          next(error);
        });
      }).catch(err => next(err));
    });
  }
}

export default new ConverterRoutes().router;