import * as bcrypt from "bcryptjs";
import { NextFunction } from "connect";
import { Request, Response, Router } from "express";
import User from "../model/workspace/User";
import * as ErrorUtil from "../util/ErrorUtil";

class RegisterRoutes {

    public router: Router;

    public constructor() {
        this.router = Router();
        this.setupRegister();
    }

    private setupRegister() {
        this.router.post("/", async (req: Request, res: Response, next: NextFunction) => {
            if (req.fields && req.fields.username && req.fields.password) {
                try {
                    const userName =  req.fields.username as string;
                    const password =  req.fields.password as string;
                    let user = await User.findOne(userName);
                    if (user) {
                        next(new Error("User already exists"));
                    }
                    user = new User();
                    user.name = userName;
                    const salt = await bcrypt.genSalt();
                    user.password = await bcrypt.hash(password, salt);
                    await user.save();
                    return res.end();
                } catch (err) {
                    return next(err);
                }
            } else {
                return next(ErrorUtil.MissingFieldError(req.fields, "username", "password"));
            }
        });
    }
}

export default new RegisterRoutes().router;
