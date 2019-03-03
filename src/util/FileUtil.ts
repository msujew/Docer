import { Request } from "express";
import * as fs from "fs-extra";
import * as path from "path";

export const resources = "resources";
export const csl = "csl";
export const templates = "templates";
export const syntaxDefinitions = "syntax-definitions";
export const temporary = "tmp";
export const uploads = "uploads";

export function combine(...paths: string[]): string {
	return path.join(...paths);
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
	let fullPath = combine(...folder);
	let subdirs = await readdir(fullPath);
	for (let subdir of subdirs) {
		let res = path.resolve(fullPath, subdir);
		if ((await fs.stat(res)).isDirectory()) {
			yield* readdirRecursive(res);
		} else {
			yield res;
		}
	}
}

export async function* readdirRecursiveFiltered(filter: string, ...folder: string[]): AsyncIterableIterator<string> {
	for await (let item of readdirRecursive(...folder)) {
		if (item.endsWith(filter)) {
			yield item;
		}
	}
}

export async function* readdirStats(...folder: string[]): AsyncIterableIterator<[string, fs.Stats]> {
	let fileNames = await readdir(combine(...folder));
	for (let fileName of fileNames) {
		let fullPath = combine(...folder, fileName);
		let stat = await fs.stat(fullPath);
		yield [fileName, stat];
	}
}

export async function mkdir(...folder: string[]): Promise<void> {
	try { await fs.ensureDir(combine(...folder)); } catch { }
}

export async function mkdirs(...fileName: string[]): Promise<void> {
	let folder = path.dirname(combine(...fileName));
	await mkdir(folder);
}

export function mkdirSync(...folder: string[]) {
	fs.mkdirSync(combine(...folder), { recursive: true });
}

export function mkdirsSync(...fileName: string[]) {
	let folder = path.dirname(combine(...fileName));
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
	let files: string[] = [];
	if (req.files) {
		for (let fileName of Object.keys(req.files)) {
			if (fileName.indexOf("..") == -1) {
				files.push(fileName);
				let file = req.files[fileName];
				await move(file.path, combine(folder, fileName));
			}
		}
	}
	return files;
}