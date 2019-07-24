import { Fields } from "formidable";

export const UnknownErrorCode = 0;
export const MissingFormParameterCode = 1;
export const NotLoggedInCode = 2;
export const PandocFailureCode = 3;
export const InvalidCredentialsCode = 4;
export const WorkspaceItemNotFoundCode = 5;
export const WorkspaceNotFoundCode = 6;

export const WorkspaceItemNotFoundError = new Error("Specified workspace item not found");
WorkspaceItemNotFoundError.status = 500;
WorkspaceItemNotFoundError.appCode = WorkspaceItemNotFoundCode;
export const WorkspaceNotFoundError = new Error("Specified workspace not found");
WorkspaceNotFoundError.status = 500;
WorkspaceNotFoundError.appCode = WorkspaceItemNotFoundCode;
export const PandocFailedError = new Error("Pandoc finished expectedly");
PandocFailedError.appCode = PandocFailureCode;
PandocFailedError.status = 400;
export const NotLoggedInError = new Error("Not logged in");
NotLoggedInError.status = 403;
NotLoggedInError.appCode = NotLoggedInCode;
export const InvalidCredentialsError = new Error("Invalid credentials");
InvalidCredentialsError.status = 401;
InvalidCredentialsError.appCode = InvalidCredentialsCode;

export function MissingFieldError(fields: Fields | undefined, ...fieldNames: string[]): ReferenceError {
    const missingFields: string[] = [];
    if (fields) {
        fieldNames
            .filter((e) => fields[e] === undefined)
            .forEach((e) => missingFields.push(e));
    } else {
        missingFields.push("no fields specified");
    }

    const refError = new ReferenceError("Missing request fields: " + missingFields.join());
    refError.appCode = MissingFormParameterCode;
    refError.status = 400;
    return refError;
}
