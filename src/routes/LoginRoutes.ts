import * as connect from "connect";
import { Request, Response, Router } from "express";
import User from "../model/workspace/User";
import * as bcrypt from "bcryptjs";
import UserSession from "../model/workspace/UserSession";
import { v4 as uuid } from "uuid";

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
                    let userName = <string>req.fields.username;
                    let password = <string>req.fields.password;
                    let user = await User.findOne({ name: userName }, { relations: ["workspaces"] });
                    if (!user || !(await bcrypt.compare(password, user.password))) {
                        let error = new Error("Invalid credentials");
                        error.status = 401;
                        return next(error);
                    }
                    let tokenObject = new TokenObject();
                    if (user.workspaces) {
                        tokenObject.workspaces = user.workspaces.map(workspace => workspace.name);
                    }
                    let existing = await UserSession.findOne({ user: { name: userName }});
                    if (existing) {
                        tokenObject.token = existing.token;
                        res.json(tokenObject);
                        return res.end();
                    }
                    let session = new UserSession();
                    session.token = uuid();
                    session.user = user;
                    session.save();
                    tokenObject.token = session.token;
                    res.json(tokenObject);
                } catch (err) {
                    return next(err);
                }
            }
            res.end();
        });
    }
}

class TokenObject {

    token: string = "";
    workspaces: string[] = [];

}

export default new LoginRoutes().router;