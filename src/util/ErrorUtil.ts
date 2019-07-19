export const MissingConverterTypeError = new ReferenceError("Missing converter type");
export const PandocFailedError = new Error("Pandoc finished expectedly");
export const MissingFieldsError = new ReferenceError("Missing request fields");
export const NotLoggedInError = new Error("Not logged in");
NotLoggedInError.status = 403;
export function MissingFieldError(fieldName: string) : ReferenceError {
    return new ReferenceError(`Missing ${fieldName} request field`);
}