import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import { readFile } from "fs-extra";
import { v4 as uuid } from "uuid";
import ConverterData from "../model/ConverterData";
import UserWorkspace from "../model/workspace/UserWorkspace";
import UserWorkspaceItem from "../model/workspace/UserWorkspaceItem";
import * as auth from "../process/Auth";
import Pandoc from "../process/Pandoc";
import * as ErrorUtil from "../util/ErrorUtil";
import * as FileUtil from "../util/FileUtil";

class WorkspaceRoutes {

    public router = Router();

    public constructor() {
        this.router = Router();
        this.setup();
    }

    private setup() {
        this.router.get("/", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.name && req.fields.token) {
                try {
                    const name =  req.fields.name as string;
                    const token =  req.fields.token as string;
                    const user = await auth.authenticatedUser(token);
                    if (user) {
                        if (!name) {
                            const workspaces = await UserWorkspace.find({ user });
                            const names: string[] = [];
                            for (const workspace of workspaces) {
                                names.push(workspace.name);
                            }
                            return res.json(names);
                        } else {
                            let workspace = await UserWorkspace.findOne({ user, name }, { relations: ["items"] });

                            if (!workspace) {
                                workspace = new UserWorkspace(name, user);
                                await workspace.save();
                            }
                            if (workspace.items) {
                                for (const item of workspace.items) {
                                    item.content = undefined;
                                    item.id = undefined;
                                }
                            }

                            workspace.user = undefined;
                            return res.json(workspace);
                        }
                    } else {
                        return next(ErrorUtil.NotLoggedInError);
                    }
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(ErrorUtil.MissingFieldError(req.fields, "name", "token"));
            }
        });
        this.router.get("/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.token) {
                try {
                    const workspaceName =  req.fields.workspace as string;
                    const token =  req.fields.token as string;
                    const user = await auth.authenticatedUser(token);
                    if (user) {
                        const path =  req.fields.name as string;
                        const workspace = await UserWorkspace.findOne({ name: workspaceName, user });
                        const workspaceItem = await UserWorkspaceItem.findOne({ workspace, path });
                        if (workspaceItem) {
                            return res.end(workspaceItem.content);
                        } else {
                            return next(ErrorUtil.WorkspaceItemNotFoundError);
                        }
                    } else {
                        return next(ErrorUtil.NotLoggedInError);
                    }
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(ErrorUtil.MissingFieldError(req.fields, "workspace", "name", "token"));
            }
        });
        this.router.post("/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.token && req.files) {
                try {
                    const workspaceName =  req.fields.workspace as string;
                    const path =  req.fields.name as string;
                    const token =  req.fields.token as string;
                    const user = await auth.authenticatedUser(token);
                    if (user) {
                        const workspace = await UserWorkspace.findOne({ name: workspaceName, user });
                        let workspaceItem = await UserWorkspaceItem.findOne({ workspace, path });
                        if (!workspaceItem && workspace) {
                            workspaceItem = new UserWorkspaceItem();
                            workspaceItem.workspace = workspace;
                            workspaceItem.path = path;
                        }
                        if (workspaceItem) {
                            workspaceItem.content = await readFile(req.files.content.path);
                            let date: Date = new Date();
                            workspaceItem.date = date.toISOString();
                            await workspaceItem.save();
                        }
                        return res.end();
                    } else {
                        return next(ErrorUtil.NotLoggedInError);
                    }
                } catch (err) {
                    return next(err);
                }

            } else {
                next(ErrorUtil.MissingFieldError(req.fields, "workspace", "name", "token"));
            }
        });
        this.router.delete("/", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.token) {
                try {
                    const workspaceName =  req.fields.workspace as string;
                    const token =  req.fields.token as string;
                    const user = await auth.authenticatedUser(token);
                    if (user) {
                        const workspace = await UserWorkspace.findOne({ user, name: workspaceName });
                        if (workspace) {
                            await UserWorkspace.remove(workspace);
                        }
                        return res.end();
                    } else {
                        return next(ErrorUtil.NotLoggedInError);
                    }
                } catch (err) {
                    return next(err);
                }
            } else {
                next(ErrorUtil.MissingFieldError(req.fields, "workspace", "token"));
            }
        });
        this.router.move("/", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.rename && req.fields.token) {
                try {
                    const workspaceName =  req.fields.workspace as string;
                    const rename =  req.fields.rename as string;
                    const token =  req.fields.token as string;
                    const user = await auth.authenticatedUser(token);
                    if (user) {
                        const workspace = await UserWorkspace.findOne({ user, name: workspaceName });
                        if (workspace) {
                            workspace.name = rename;
                            await workspace.save();
                        }
                        return res.end();
                    } else {
                        return next(ErrorUtil.NotLoggedInError);
                    }
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(ErrorUtil.MissingFieldError(req.fields, "workspace", "name", "token"));
            }
        });
        this.router.move("/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.rename && req.fields.token) {
                try {
                    const workspaceName =  req.fields.workspace as string;
                    const path =  req.fields.name as string;
                    const rename =  req.fields.rename as string;
                    const token =  req.fields.token as string;
                    const user = await auth.authenticatedUser(token);
                    if (user) {
                        const workspace = await UserWorkspace.findOne({ user, name: workspaceName }, {
                            relations: ["items"]
                        });
                        if (workspace && workspace.items) {
                            for (const item of workspace.items) {
                                if (item.path === path) {
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
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(ErrorUtil.MissingFieldError(req.fields, "workspace", "name", "rename", "token"));
            }
        });
        this.router.move("/folder", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.rename && req.fields.token) {
                try {
                    const workspaceName =  req.fields.workspace as string;
                    const path =  req.fields.name as string;
                    const rename =  req.fields.rename as string;
                    const token =  req.fields.token as string;
                    const user = await auth.authenticatedUser(token);
                    if (user) {
                        const workspace = await UserWorkspace.findOne({ user, name: workspaceName }, {
                            relations: ["items"]
                        });
                        if (workspace) {
                            await workspace.folderRename(path, rename);
                        }
                        return res.end();
                    } else {
                        return next(ErrorUtil.NotLoggedInError);
                    }
                } catch (err) {
                    return next(err);
                }
            } else {
                next(ErrorUtil.MissingFieldError(req.fields, "workspace", "name", "rename", "token"));
            }
        });
        this.router.delete("/folder", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.token) {
                try {
                    const workspaceName =  req.fields.workspace as string;
                    const path =  req.fields.name as string;
                    const token =  req.fields.token as string;
                    const user = await auth.authenticatedUser(token);
                    if (user) {
                        const workspace = await UserWorkspace.findOne({ user, name: workspaceName }, {
                            relations: ["items"]
                        });
                        if (workspace) {
                            await workspace.deleteFolder(path);
                        }
                        return res.end();
                    } else {
                        return next(ErrorUtil.NotLoggedInError);
                    }
                } catch (err) {
                    return next(err);
                }
            } else {
                next(ErrorUtil.MissingFieldError(req.fields, "workspace", "name", "token"));
            }
        });
        this.router.delete("/file", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.workspace && req.fields.name && req.fields.token) {
                try {
                    const workspaceName =  req.fields.workspace as string;
                    const path =  req.fields.name as string;
                    const token =  req.fields.token as string;
                    const user = await auth.authenticatedUser(token);
                    if (user) {
                        const workspace = await UserWorkspace.findOne({ user, name: workspaceName });
                        UserWorkspaceItem.delete({ workspace, path });
                        return res.end();
                    } else {
                        return next(ErrorUtil.NotLoggedInError);
                    }
                } catch (err) {
                    return next(err);
                }
            } else {
                next(ErrorUtil.MissingFieldError(req.fields, "token", "name"));
            }
        });
        this.router.post("/convert", async (req: Request, res: Response, next: NextFunction) => {
            const pandoc = Pandoc.getInstance();
            const folder = FileUtil.resource(FileUtil.temporary, uuid());
            if (req.fields &&
                req.fields.token &&
                req.fields.workspace &&
                req.fields.ext &&
                req.fields.from &&
                req.fields.to) {
                try {
                    const user = await auth.authenticatedUser( req.fields.token as string);
                    if (user) {
                        const workspaceName =  req.fields.workspace as string;
                        const workspace = await UserWorkspace.findOne({ user, name: workspaceName });
                        if (workspace) {
                            const data = new ConverterData();
                            data.from =  req.fields.from as string;
                            data.to =  req.fields.to as string;
                            data.template =  req.fields.template as string;
                            data.csl =  req.fields.csl as string;
                            data.extension =  req.fields.ext as string;
                            await FileUtil.saveWorkspace(workspace, folder);
                            const buffer = await pandoc.convert(data, folder);
                            if (data.isBinary()) {
                                res.type(data.to || "binary");
                                return res.end(buffer, "binary");
                            } else {
                                return res.end(buffer.toString("utf-8"));
                            }
                        } else {
                            return next(ErrorUtil.WorkspaceNotFoundError);
                        }
                    } else {
                        return next(ErrorUtil.NotLoggedInError);
                    }
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(ErrorUtil.MissingFieldError(req.fields, "token", "workspace", "ext", "from", "to"));
            }
        });
    }
}

export default new WorkspaceRoutes().router;
