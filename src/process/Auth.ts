import UserSession from "../model/workspace/UserSession";
import User from "../model/workspace/User";

export async function authenticatedUser(token: string): Promise<User | undefined> {
    let session = await UserSession.findOne({ token: token }, { relations: [ "user" ] });
    if (session) {
        return session.user;
    } else {
        return undefined;
    }
}