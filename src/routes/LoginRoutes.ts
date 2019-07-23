import * as bcrypt from "bcryptjs";
import * as connect from "connect";
import { Request, Response, Router } from "express";
import { v4 as uuid } from "uuid";
import User from "../model/workspace/User";
import UserSession from "../model/workspace/UserSession";
import * as ErrorUtil from "../util/ErrorUtil";

class LoginRoutes {

    public router: Router;

    public constructor() {
        this.router = Router();
        this.setupLogin();
    }

    private setupLogin() {
        this.router.post("/", async (req: Request, res: Response, next: connect.NextFunction) => {
            if (req.fields && req.fields.username && req.fields.password) {
                try {
                    const userName =  req.fields.username as string;
                    const password =  req.fields.password as string;
                    const user = await User.findOne({ name: userName }, { relations: ["workspaces"] });
                    if (!user || !(await bcrypt.compare(password, user.password))) {
                        return next(ErrorUtil.InvalidCredentialsError);
                    }
                    const tokenObject = new TokenObject();
                    if (user.workspaces) {
                        tokenObject.workspaces = user.workspaces.map((workspace) => workspace.name);
                    }
                    const existing = await UserSession.findOne({ user: { name: userName }});
                    if (existing) {
                        tokenObject.token = existing.token;
                        res.json(tokenObject);
                        return res.end();
                    }
                    const session = new UserSession();
                    session.token = uuid();
                    session.user = user;
                    session.save();
                    tokenObject.token = session.token;
                    return res.json(tokenObject);
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(ErrorUtil.MissingFieldError(req.fields, "username", "password"));
            }
        });
    }
}

// tslint:disable-next-line: max-classes-per-file
class TokenObject {
    public token: string = "";
    public workspaces: string[] = [];
}

export default new LoginRoutes().router;
