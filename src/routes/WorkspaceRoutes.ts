import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import UserWorkspace from "../model/workspace/UserWorkspace";
import UserWorkspaceItem from "../model/workspace/UserWorkspaceItem";
import * as ErrorUtil from "../util/ErrorUtil";
import { readFile } from "fs-extra";
import * as auth from "../process/Auth";
import Pandoc from "../process/Pandoc";
import * as FileUtil from "../util/FileUtil";
import { v4 as uuid } from "uuid";
import ConverterData from "../model/ConverterData";

class WorkspaceRoutes {

    public router = Router();

    public constructor() {
        this.router = Router();
        this.setup();
    }

    private setup() {
        this.router.get("/", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.token) {
                let name = <string>req.fields.name;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    if (!name) {
                        let workspaces = await UserWorkspace.find({ user: user });
                        let names: string[] = [];
                        for (let workspace of workspaces) {
                            names.push(workspace.name);
                        }
                        res.json(names);
                    } else {
                        let workspace = await UserWorkspace.findOne({ user: user, name: name }, {
                            relations: ["items"]
                        });
    
                        if (!workspace) {
                            workspace = new UserWorkspace();
                            workspace.name = name;
                            workspace.user = user;
                            workspace.directories = [];
                            await workspace.save();
                        }
    
                        if (workspace && workspace.items) {
                            for (let item of workspace.items) {
                                workspace.files.push(item.path);
                            }
                            workspace.items = undefined;
                        }
    
                        workspace.user = undefined;
                        res.json(workspace);
                    }
                } else {
                    return next(ErrorUtil.NotLoggedInError);
                }
            } else {
                next(ErrorUtil.MissingFieldError("token"));
            }
        });
        this.router.get("/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.token) {
                let workspaceName = <string>req.fields.workspace;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let path = <string>req.fields.name;
                    let workspace = await UserWorkspace.findOne({ name: workspaceName, user: user });
                    let workspaceItem = await UserWorkspaceItem.findOne({ workspace: workspace, path: path });
                    if (workspaceItem) {
                        res.send(workspaceItem.content);
                    } else {
                        return next("Item not found");
                    }
                }
                return res.end();
            } else {
                return next(ErrorUtil.MissingFieldError("name | token"));
            }
        });
        this.router.post("/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.token && req.files) {
                let workspaceName = <string>req.fields.workspace;
                let path = <string>req.fields.name;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspace = await UserWorkspace.findOne({ name: workspaceName, user: user });
                    let workspaceItem = await UserWorkspaceItem.findOne({ workspace: workspace, path: path });
                    if (workspaceItem) {
                        workspaceItem.content = await readFile(req.files.content.path);
                        await workspaceItem.save();
                    } else {
                        if (workspace) {
                            workspaceItem = new UserWorkspaceItem();
                            workspaceItem.workspace = workspace;
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
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.token) {
                let workspaceName = <string>req.fields.workspace;
                let path = <string>req.fields.name;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspace = await UserWorkspace.findOne({ user: user, name: workspaceName });
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
            if (req.fields && req.fields.workspace && req.fields.token) {
                let workspaceName = <string>req.fields.workspace;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspace = await UserWorkspace.findOne({ user: user, name: workspaceName });
                    if (workspace) {
                        await UserWorkspace.remove(workspace);
                    }
                    return res.end();
                } else {
                    return next(ErrorUtil.NotLoggedInError);
                }
            } else {
                next(ErrorUtil.MissingFieldError("token"));
            }
        });
        this.router.move("/", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.rename && req.fields.token) {
                let workspaceName = <string>req.fields.workspace;
                let rename = <string>req.fields.rename;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspace = await UserWorkspace.findOne({ user: user, name: workspaceName });
                    if (workspace) {
                        workspace.name = rename;
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
        this.router.move("/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.rename && req.fields.token) {
                let workspaceName = <string>req.fields.workspace;
                let path = <string>req.fields.name;
                let rename = <string>req.fields.rename;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspace = await UserWorkspace.findOne({ user: user, name: workspaceName }, { relations: ["items"] });
                    if (workspace && workspace.items) {
                        for (let item of workspace.items) {
                            if (item.path == path) {
                                item.path = rename;
                                await item.save();
                                break;
                            }
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
        this.router.move("/folder", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.rename && req.fields.token) {
                let workspaceName = <string>req.fields.workspace;
                let path = <string>req.fields.name;
                let rename = <string>req.fields.rename;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspace = await UserWorkspace.findOne({ user: user, name: workspaceName }, { relations: ["items"] });
                    if (workspace && workspace.directories) {
                        await workspace.folderRename(path, rename);
                    }
                    return res.end();
                } else {
                    return next(ErrorUtil.NotLoggedInError);
                }
            } else {
                next(ErrorUtil.MissingFieldError("name | token"));
            }
        });
        this.router.delete("/folder", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.token) {
                let workspaceName = <string>req.fields.workspace;
                let path = <string>req.fields.name;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspace = await UserWorkspace.findOne({ user: user, name: workspaceName }, { relations: ["items"] });
                    if (workspace && workspace.directories) {
                        await workspace.deleteFolder(path);
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
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.token) {
                let workspaceName = <string>req.fields.workspace;
                let path = <string>req.fields.name;
                let token = <string>req.fields.token;
                let user = await auth.authenticatedUser(token);
                if (user) {
                    let workspace = await UserWorkspace.findOne({ user: user, name: workspaceName });
                    UserWorkspaceItem.delete({ workspace: workspace, path: path });
                    return res.end();
                } else {
                    return next(ErrorUtil.NotLoggedInError);
                }
            } else {
                next(ErrorUtil.MissingFieldError("token | name"));
            }
        });
        this.router.post("/convert", async (req: Request, res: Response, next: NextFunction) => {
            let pandoc = Pandoc.getInstance();
            let folder = FileUtil.combine(FileUtil.resources, FileUtil.temporary, uuid());
            if (req.fields && req.fields.token && req.fields.workspace && req.fields.ext && req.fields.from && req.fields.to) {
                let user = await auth.authenticatedUser(<string>req.fields.token);
                if (user) {
                    let workspaceName = <string>req.fields.workspace;
                    let workspace = await UserWorkspace.findOne({ user: user, name: workspaceName });
                    if (workspace) {
                        let data = new ConverterData();
                        data.from = <string>req.fields.from;
                        data.to = <string>req.fields.to;
                        data.template = <string>req.fields.template;
                        data.csl = <string>req.fields.csl;
                        data.extension = <string>req.fields.ext;
                        await FileUtil.saveWorkspace(workspace, folder);
                        let buffer = await pandoc.convert(data, folder);
                        if (data.isBinary()) {
                            res.type(data.to || "binary");
                            res.end(buffer, 'binary');
                        } else {
                            res.send(buffer.toString("utf-8"));
                        }
                    }
                }
                
            }
        });
    }
}

export default new WorkspaceRoutes().router;