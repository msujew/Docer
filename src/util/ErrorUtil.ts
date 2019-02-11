export const MissingConverterTypeError = new ReferenceError("Missing converter type");
export const PandocFailedError = new Error("Pandoc finished expectedly");
export const MissingFieldsError = new ReferenceError("Missing request fields");
export function MissingFieldError(fieldName: string) : ReferenceError {
    return new ReferenceError(`Missing ${fieldName} request field`);
}