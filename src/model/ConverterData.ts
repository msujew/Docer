import { Request } from "express";
import * as FileUtil from "../util/FileUtil";
import * as ErrorUtil from "../util/ErrorUtil";

export class ConverterData {
  /**
   * Gets or sets the source format.  
   * Available formats:
   * * commonmark
   * * creole
   * * docbook
   * * docx
   * * epub
   * * fb2
   * * gfm
   * * haddock
   * * html
   * * jats
   * * json
   * * latex
   * * markdown
   * * markdown_mmd
   * * markdown_phpextra
   * * markdown_strict
   * * mediawiki
   * * man
   * * muse
   * * native
   * * odt
   * * opml
   * * org
   * * rst
   * * t2t
   * * textile
   * * tikiwiki
   * * twiki
   * * vimwiki
   */
  from: string = "markdown";
  /**
   * Gets or sets the target format
   */
  to: string = "pdf";
  files: string[] = [];
  /**
   * Gets or sets the template for converting
   */
  template: string | undefined;

  public async save(req: Request, folder: string): Promise<void> {
    if (req.fields) {

      if (!req.fields.from || !req.fields.to) {
        throw ErrorUtil.MissingConverterTypeError;
      }
      this.from = <string>req.fields.from;
      this.to = <string>req.fields.to;
      this.template = <string>req.fields.template;
      this.files = await FileUtil.saveFiles(req, folder);
    }
    else {
      throw ErrorUtil.MissingFieldError;
    }
  }

  public isBinary() {
    switch (this.to)
    {
      case "pdf":
      case "odt":
      case "doc":
      case "docx":
        return true;
    }
    return false;
  };
}