import { Request } from "express";
import * as ErrorUtil from "../util/ErrorUtil";
import * as FileUtil from "../util/FileUtil";

export default class ConverterData {

    /**
     * Gets or sets the source format.
     */
    public from: string = "markdown";
    /**
     * Gets or sets the target format
     */
    public to: string = "pdf";
    /**
     * Gets or sets the template for converting
     */
    public template?: string;
    public csl?: string;
    public extension?: string;

    public async save(req: Request, folder: string): Promise<void> {
        if (req.fields && req.fields.from && req.fields.to) {
            this.from =  req.fields.from as string;
            this.to =  req.fields.to as string;
            this.template =  req.fields.template as string;
            this.csl =  req.fields.csl as string;
            this.extension =  req.fields.ext as string;
            await FileUtil.saveFiles(req, folder);
        } else {
            throw ErrorUtil.MissingFieldError(req.fields, "from", "to");
        }
    }

    public isBinary() {
        switch (this.to) {
            case "pdf":
            case "odt":
            case "doc":
            case "docx":
                return true;
        }
        return false;
    }

    public isPlainText() {
        switch (this.to) {
            case "markdown":
            case "latex":
            case "txt":
            case "html":
                return true;
        }
        return false;
    }
}
