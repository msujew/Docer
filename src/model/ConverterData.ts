import { Request } from "express";
import * as path from "path";
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
  //content: string;
  files: string[] = [];
  /**
   * Gets or sets the template for converting
   */
  template: string;

  public save(req: Request, folder: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.from = <string>req.fields.from || "markdown";
      this.to = <string>req.fields.to || "markdown";
      //this.content = <string>req.fields.content || "";
      this.template = <string>req.fields.template || null;
      this.files = [];
      FileUtil.mkdir(folder);
      Promise.all(Object.keys(req.files).map(fileName => {
        return new Promise<void>((resolve, reject) => {
          this.files.push(fileName);
          let file = req.files[fileName];
          FileUtil.move(file.path, path.join(folder, fileName))
          .then(() => resolve())
          .catch(err => reject(err));
        });
      }))
      .then(() => resolve())
      .catch(err => reject(err));
    });
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