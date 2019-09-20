export class PandocError implements Error {

    public name: string = "PandocError";
    public message: string = "";
    public pandoc: string = "";
    public stack?: string | undefined;
    public status?: number | undefined;
    public appCode?: number | undefined;

    constructor(output: string) {
        this.pandoc = output;
        const envMatch = this.firstMatch(/LaTeX Error: Environment ([a-zA-Z0-9]+) undefined/, output);
        if (envMatch) {
            this.message = `Undefined Environment '${envMatch}'`;
            return;
        }
        const conMatch = this.firstMatch(/Undefined control sequence\.\s*l\.[0-9]+ \\([a-zA-Z0-9]+)/, output);
        if (conMatch) {
            this.message = `Undefined Command '${conMatch}'`;
            return;
        }
        const pdfMatch =
            this.firstMatch(/Package pdfpages Error: Cannot find file `(?:[a-z]:\/)?(?:[^\/]+\/)+([^\/]+)'/,
            output);
        if (pdfMatch) {
            this.message = `Missing File '${pdfMatch}'`;
            return;
        }

        this.message = "Unknown Pandoc Error";
    }

    private firstMatch(regex: RegExp, text: string): string | undefined {
        const match = regex.exec(text);
        if (match !== null) {
            return match[1];
        }
        return undefined;
    }
}
