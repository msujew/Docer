import { Request } from "express";
import * as fs from "fs-extra";
import * as path from "path";
import UserWorkspace from "../model/workspace/UserWorkspace";
import UserWorkspaceItem from "../model/workspace/UserWorkspaceItem";

export const csl = "csl";
export const templates = "templates";
export const syntaxDefinitions = "syntax-definitions";
export const temporary = "tmp";
export const uploads = "uploads";

const currentProcessResources = combine(process.cwd(), "resources");

export function resourcesDir(): string {
    return process.env.resources || currentProcessResources;
}

export function combine(...paths: string[]): string {
    return path.join(...paths);
}

export function resource(...paths: string[]): string {
    return combine(resourcesDir(), ...paths);
}

export async function write(buffer: Buffer, ...fileName: string[]): Promise<void> {
    await mkdirs(...fileName);
    return fs.writeFile(combine(...fileName), buffer);
}

export function writeSync(buffer: Buffer, ...fileName: string[]) {
    mkdirsSync(...fileName);
    fs.writeFileSync(combine(...fileName), buffer);
}

export function read(...fileName: string[]): Promise<Buffer> {
    return fs.readFile(combine(...fileName));
}

export function readSync(...fileName: string[]): Buffer {
    return fs.readFileSync(combine(...fileName));
}

export function readdir(...folder: string[]): Promise<string[]> {
    return fs.readdir(combine(...folder));
}

export function readdirSync(...folder: string[]): string[] {
    return fs.readdirSync(combine(...folder));
}

export async function* readdirRecursive(...folder: string[]): AsyncIterableIterator<string> {
    const fullPath = combine(...folder);
    const subdirs = await readdir(fullPath);
    for (const subdir of subdirs) {
        const res = path.resolve(fullPath, subdir);
        if ((await fs.stat(res)).isDirectory()) {
            yield* readdirRecursive(res);
        } else {
            yield res;
        }
    }
}

export async function* readdirRecursiveFiltered(filter: string, ...folder: string[]): AsyncIterableIterator<string> {
    for await (const item of readdirRecursive(...folder)) {
        if (item.endsWith(filter)) {
            yield item;
        }
    }
}

export async function* readdirStats(...folder: string[]): AsyncIterableIterator<[string, fs.Stats]> {
    const fileNames = await readdir(combine(...folder));
    for (const fileName of fileNames) {
        const fullPath = combine(...folder, fileName);
        const stat = await fs.stat(fullPath);
        yield [fileName, stat];
    }
}

export async function mkdir(...folder: string[]): Promise<void> {
    try { await fs.ensureDir(combine(...folder)); } catch { /* Failing is fine here */ }
}

export async function mkdirs(...fileName: string[]): Promise<void> {
    const folder = path.dirname(combine(...fileName));
    await mkdir(folder);
}

export function mkdirSync(...folder: string[]) {
    fs.mkdirSync(combine(...folder), { recursive: true });
}

export function mkdirsSync(...fileName: string[]) {
    const folder = path.dirname(combine(...fileName));
    fs.mkdirSync(folder, { recursive: true });
}

export function deleteDir(...folder: string[]): Promise<void> {
    return fs.remove(combine(...folder));
}

export function deleteDirSync(...folder: string[]) {
    fs.removeSync(combine(...folder));
}

export async function move(src: string, dest: string): Promise<void> {
    await mkdirs(dest);
    return fs.move(src, dest);
}

export function moveSync(src: string, dest: string) {
    mkdirsSync(dest);
    fs.moveSync(src, dest);
}

export async function saveFiles(req: Request, folder: string): Promise<string[]> {
    await mkdir(folder);
    const files: string[] = [];
    if (req.files) {
        for (const fileName of Object.keys(req.files)) {
            if (fileName.indexOf("..") === -1) {
                files.push(fileName);
                const file = req.files[fileName];
                await move(file.path, combine(folder, fileName));
            }
        }
    }
    return files;
}

export async function saveWorkspace(workspace: UserWorkspace, folder: string): Promise<void> {
    await mkdir(folder);
    const items = await UserWorkspaceItem.find({ workspace });
    for (const item of items) {
        if (item.content) {
            await write(item.content, folder, item.path);
        }
    }
}
