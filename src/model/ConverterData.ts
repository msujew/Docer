import { Request } from "express";
import * as FileUtil from "../util/FileUtil";
import * as ErrorUtil from "../util/ErrorUtil";

export default class ConverterData {

  /**
   * Gets or sets the source format.
   */
  from: string = "markdown";
  /**
   * Gets or sets the target format
   */
  to: string = "pdf";
  /**
   * Gets or sets the template for converting
   */
  template: string | undefined;
  csl: string | undefined;
  extension: string | undefined;

  public async save(req: Request, folder: string): Promise<void> {
    if (req.fields) {

      if (!req.fields.from || !req.fields.to) {
        throw ErrorUtil.MissingConverterTypeError;
      }
      this.from = <string>req.fields.from;
      this.to = <string>req.fields.to;
      this.template = <string>req.fields.template;
      this.csl = <string>req.fields.csl;
      this.extension = <string>req.fields.ext;
      await FileUtil.saveFiles(req, folder);
    }
    else {
      throw ErrorUtil.MissingFieldError;
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
  };

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