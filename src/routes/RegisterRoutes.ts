import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import User from "../model/workspace/User";
import * as bcrypt from "bcryptjs";

class RegisterRoutes {

    public router: Router;

    private count: number = 1;

    public constructor() {
        this.router = Router();
        this.setupRegister();
    }

    private setupRegister() {
        this.router.post("/", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.username && req.fields.password) {
                try {
                    let userName = <string>req.fields.username;
                    let password = <string>req.fields.password;
                    let user = await User.findOne(userName);
                    if (user) {
                        next(new Error("User already exists"));
                    }
                    user = new User();
                    user.name = userName;
                    let salt = await bcrypt.genSalt();
                    user.password = await bcrypt.hash(password, salt);
                    await user.save();
                } catch (err) {
                    next(err);
                    return;
                }
            }
            res.end();
        });
    }
}

export default new RegisterRoutes().router;