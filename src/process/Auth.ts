import User from "../model/workspace/User";
import UserSession from "../model/workspace/UserSession";

export async function authenticatedUser(token: string): Promise<User | undefined> {
    const session = await UserSession.findOne({ token }, { relations: ["user"] });
    if (session) {
        return session.user;
    } else {
        return undefined;
    }
}
