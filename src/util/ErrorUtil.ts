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
    let missingFields: string[] = ["no fields specified"];
    if (fields) {
        missingFields = fieldNames.filter((e) => fields[e] === undefined);
    }

    const refError = new ReferenceError("Missing request fields: " + missingFields.join());
    refError.appCode = MissingFormParameterCode;
    refError.status = 400;
    return refError;
}

export function PandocError(output: string): Error {
    // First off, try to catch the easy ones.
    const envMatch = firstMatch(/LaTeX Error: Environment ([a-zA-Z0-9]+) undefined/, output);
    if (envMatch) {
        return new Error(`Undefined Environment '${envMatch}'`);
    }
    const conMatch = firstMatch(/Undefined control sequence\.\s*l\.[0-9]+ \\([a-zA-Z0-9]+)/, output);
    if (conMatch) {
        return new Error(`Undefined Command '${conMatch}'`);
    }
    const pdfMatch = firstMatch(/Package pdfpages Error: Cannot find file `(?:[a-z]:\/)?(?:[^\/]+\/)+([^\/]+)'/,
        output);
    if (pdfMatch) {
        return new Error(`Missing File '${pdfMatch}'`);
    }

    return new Error("Unknown Pandoc Error");
}

function firstMatch(regex: RegExp, text: string): string | undefined {
    const match = regex.exec(text);
    if (match !== null) {
        return match[1];
    }
    return undefined;
}
