import { Request } from "express";
import * as fs from "fs-extra";
import * as path from "path";

export function writeSync(fileName: string, buffer: Buffer) {
	let fullFile = path.join(process.cwd(), fileName);
	mkdirs(fullFile);
	fs.writeFileSync(fullFile, buffer);
}

export function write(fileName: string, buffer: Buffer): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		let fullFile = path.join(process.cwd(), fileName);
		mkdirs(fullFile);
		fs.writeFile(fullFile, buffer, err => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

export function read(fileName: string): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		let fullFile = path.join(process.cwd(), fileName);
		fs.readFile(fullFile, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

export function readdir(folder: string): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		fs.readdir(folder, (err, files) => {
			if (err) {
				reject(err);
			} else {
				resolve(files);
			}
		});
	});
}

export function readdirStats(folder: string): Promise<[string, fs.Stats][]> {
	return new Promise<[string, fs.Stats][]>((resolve, reject) => {
    readdir(folder)
    .then(fileNames => {
      Promise.all(fileNames.map(fileName => {
        return new Promise<[string, fs.Stats]>((resolve, reject) => {
          let fullPath = path.join(folder, fileName);
          fs.stat(fullPath, (err, stat) => {
            if (err) reject(err);
            else resolve([fileName, stat]);
          });
        });
      }))
      .then(stats => resolve(stats))
      .catch(err => reject(err));
    })
    .catch(err => reject(err));
  });
}

export function mkdir(folder: string) {
	fs.mkdirSync(folder, { recursive: true });
}

export function mkdirs(fileName: string) {
	let folder = path.dirname(fileName);
	fs.mkdirSync(folder, { recursive: true });
}

export function deleteDir(folder: string): Promise<void> {
	return fs.remove(folder);
}

export function deleteDirSync(folder: string) {
	fs.removeSync(folder);
}

export function move(src: string, dest: string): Promise<void> {
	mkdirs(dest);
	return fs.move(src, dest);
}

export function moveSync(src: string, dest: string) {
	mkdirs(dest);
	fs.moveSync(src, dest);
}

export function saveFiles(req: Request, folder: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		mkdir(folder);
    Promise.all(Object.keys(req.files).map(fileName => {
      return new Promise<void>((resolve, reject) => {
        this.files.push(fileName);
        let file = req.files[fileName];
        move(file.path, path.join(folder, fileName))
        .then(() => resolve())
        .catch(err => reject(err));
      });
    }))
    .then(() => resolve())
    .catch(err => reject(err));
	});
}