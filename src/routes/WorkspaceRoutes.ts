import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import { UserWorkspace } from "../model/workspace/UserWorkspace";
import { UserWorkspaceItem } from "../model/workspace/UserWorkspaceItem";
import * as FileUtil from "../util/FileUtil";
import * as ErrorUtil from "../util/ErrorUtil";
import { readFile } from "fs-extra";

class WorkspaceRoutes {

    public router = Router();

    public constructor() {
        this.router = Router();
        this.setup();
    }

    private setup() {
        this.router.param("user", (req: Request, _res: Response, next: NextFunction, user: string) => {
            if (req.fields) {
                req.fields.user = user;
            }
            next();
        });
        this.router.get("/:user", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.user) {
                let user = <string>req.fields.user
                let workspace = await UserWorkspace.findOne({ where: { user: user }});
                
                if (!workspace) {
                    workspace = new UserWorkspace();
                    workspace.user = user;
                    workspace.files = [];
                    workspace.directores = [];
                    await workspace.save();
                }
                res.json(workspace);
            } else {
                next(ErrorUtil.MissingFieldError("user"));
            }
        });
        this.router.get("/:user/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name && req.fields.user && req.files) {
                let user = <string>req.fields.user;
                let path = <string>req.fields.name;
                let workspaceItem = await UserWorkspaceItem.findOne({ where: { user: user, path: path }});
                if (workspaceItem) {
                    res.send(workspaceItem.content);
                }
                res.send();
            } else {
                next(ErrorUtil.MissingFieldError("user"));
            }
        });
        this.router.post("/:user", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.user) {
                let workspace = new UserWorkspace();
                workspace.user = <string>req.fields.user;
                workspace.files = [];
                workspace.directores = [];
                await workspace.save();
                res.end();
            } else {
                next(ErrorUtil.MissingFieldError("user"));
            }
        });
        this.router.post("/:user/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name && req.fields.user && req.files) {
                let user = <string>req.fields.user;
                let path = <string>req.fields.name;
                let workspaceItem = await UserWorkspaceItem.findOne({ where: { user: user, path: path }});
                if (workspaceItem) {
                    workspaceItem.content = await readFile(req.files.content.path);
                    await workspaceItem.save();
                } else {
                    let workspace = await UserWorkspace.findOne({ where: { user: user }});
                    if (workspace && workspace.files) {
                        workspace.files.push(path);
                        await workspace.save();
                        let workspaceItem = new UserWorkspaceItem();
                        workspaceItem.user = user;
                        workspaceItem.path = path;
                        workspaceItem.content = await readFile(req.files.content.path);
                        await workspaceItem.save();
                    }
                }
                res.end();
            } else {
                next(ErrorUtil.MissingFieldError("name"));
            }
        });
        this.router.delete("/:name", (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name) {
                let name = <string>req.fields.name;
                FileUtil.deleteDir(FileUtil.resources, FileUtil.templates, name)
                    .then(() => res.end())
                    .catch(err => next(err));
            } else {
                next(ErrorUtil.MissingFieldError("name"));
            }
        });
    }

    private async readFile(path: string) {
        return await FileUtil.read(path);
    }
}

export default new WorkspaceRoutes().router;