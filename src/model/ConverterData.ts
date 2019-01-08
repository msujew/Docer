import { Request } from "express";
import * as FileUtil from "../util/FileUtil";

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
  from: string;
  /**
   * Gets or sets the target format
   */
  to: string;
  files: string[] = [];
  /**
   * Gets or sets the template for converting
   */
  template: string;

  public async save(req: Request, folder: string): Promise<void> {
    this.from = <string>req.fields.from;
    this.to = <string>req.fields.to;

    if (!this.from || !this.to) {
      throw new Error("Missing converter type");
    }

    this.template = <string>req.fields.template || null;
    this.files = await FileUtil.saveFiles(req, folder);
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