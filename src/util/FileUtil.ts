import { Request } from "express";
import * as fs from "fs-extra";
import * as path from "path";

export const resources = "resources";
export const templates = "templates";
export const syntaxDefinitions = "syntax-definitions";
export const temporary = "tmp";
export const uploads = "uploads";

export function combine(...paths: string[]): string {
	return path.join(...paths);
}

export function write(buffer: Buffer, ...fileName: string[]): Promise<void> {
	mkdirsSync(...fileName);
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

export async function readdirStats(...folder: string[]): Promise<[string, fs.Stats][]> {
	let fileNames = await readdir(combine(...folder));
	let stats: [string, fs.Stats][] = [];
	for (let fileName of fileNames) {
		let fullPath = combine(...folder, fileName);
		let stat = await fs.stat(fullPath);
		stats.push([fileName, stat]);
	}
	return stats;
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
	for (let fileName of Object.keys(req.files)) {
		files.push(fileName);
		let file = req.files[fileName];
		await move(file.path, combine(folder, fileName));
	}
	return files;
}