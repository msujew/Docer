import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import UserWorkspace from "../model/workspace/UserWorkspace";
import UserWorkspaceItem from "../model/workspace/UserWorkspaceItem";
import * as ErrorUtil from "../util/ErrorUtil";
import { readFile } from "fs-extra";
import * as auth from "../process/Auth";

class WorkspaceRoutes {

    public router = Router();

    public constructor() {
        this.router = Router();
        this.setup();
    }

    private setup() {
        this.router.get("/", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.token) {
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspace = await UserWorkspace.findOne({ user: user.name });

                    if (!workspace) {
                        workspace = new UserWorkspace();
                        workspace.user = user.name;
                        workspace.files = [];
                        workspace.directories = [];
                        await workspace.save();
                    }

                    res.json(workspace);
                } else {
                    return next(ErrorUtil.NotLoggedInError);
                }
            } else {
                next(ErrorUtil.MissingFieldError("token"));
            }
        });
        this.router.get("/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name && req.fields.token) {
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let path = <string>req.fields.name;
                    let workspaceItem = await UserWorkspaceItem.findOne({ user: user.name, path: path });
                    if (workspaceItem) {
                        res.send(workspaceItem.content);
                    }
                }
                res.end();
            } else {
                next(ErrorUtil.MissingFieldError("name | token"));
            }
        });
        this.router.post("/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name && req.fields.token && req.files) {
                let path = <string>req.fields.name;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspaceItem = await UserWorkspaceItem.findOne({ user: user.name, path: path });
                    if (workspaceItem) {
                        workspaceItem.content = await readFile(req.files.content.path);
                        await workspaceItem.save();
                    } else {
                        let workspace = await UserWorkspace.findOne({ user: user.name });
                        if (workspace && workspace.files) {
                            workspace.files.push(path);
                            await workspace.save();
                            workspaceItem = new UserWorkspaceItem();
                            workspaceItem.user = user.name;
                            workspaceItem.path = path;
                            workspaceItem.content = await readFile(req.files.content.path);
                            await workspaceItem.save();
                        }
                    }
                    return res.end();
                } else {
                    return next(ErrorUtil.NotLoggedInError);
                }
            } else {
                next(ErrorUtil.MissingFieldError("name | token"));
            }
        });
        this.router.post("/folder", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name && req.fields.token) {
                let path = <string>req.fields.name;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspace = await UserWorkspace.findOne({ user: user.name });
                    if (workspace && workspace.directories) {
                        workspace.directories.push(path);
                        await workspace.save();
                    }
                    return res.end();
                } else {
                    return next(ErrorUtil.NotLoggedInError);
                }
            } else {
                next(ErrorUtil.MissingFieldError("name | token"));
            }
        });
        this.router.delete("/", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.token) {
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    await UserWorkspaceItem.delete({ user: user.name });
                    await UserWorkspace.delete({ user: user.name });
                    return res.end();
                } else {
                    return next(ErrorUtil.NotLoggedInError);
                }
            } else {
                next(ErrorUtil.MissingFieldError("token"));
            }
        });
        this.router.delete("/folder", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name && req.fields.token) {
                let path = <string>req.fields.name;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspace = await UserWorkspace.findOne({ user: user.name });
                    if (workspace && workspace.directories) {
                        workspace.directories = workspace.directories.filter(e => e != path);
                        await workspace.save();
                    }
                    return res.end();
                } else {
                    return next(ErrorUtil.NotLoggedInError);
                }
            } else {
                next(ErrorUtil.MissingFieldError("name | token"));
            }
        });
        this.router.delete("/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name && req.fields.token) {
                let path = <string>req.fields.name;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    UserWorkspaceItem.delete({ user: user.name, path: path });
                    let workspace = await UserWorkspace.findOne({ user: user.name });
                    if (workspace && workspace.files) {
                        workspace.files = workspace.files.filter(e => e != path);
                        await workspace.save();
                    }
                    return res.end();
                } else {
                    return next(ErrorUtil.NotLoggedInError);
                }
            } else {
                next(ErrorUtil.MissingFieldError("token | name"));
            }
        });
    }
}

export default new WorkspaceRoutes().router;