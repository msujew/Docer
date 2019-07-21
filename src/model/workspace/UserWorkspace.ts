import { Entity, PrimaryColumn, Column, BaseEntity, OneToMany, PrimaryGeneratedColumn, ManyToOne, Index } from "typeorm";
import UserWorkspaceItem from "./UserWorkspaceItem";
import User from "./User";
import * as FileUtil from "../../util/FileUtil";

@Entity()
@Index(["user", "name"])
export default class UserWorkspace extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number | undefined;

    @ManyToOne(_type => User)
    public user: User | undefined;

    @Column()
    public name: string = "";

    @OneToMany(_type => UserWorkspaceItem, item => item.workspace, { onDelete: "CASCADE" })
    public items: UserWorkspaceItem[] | undefined;

    public files: string[] = [];

    @Column("simple-array")
    public directories: string[] | undefined;

    public async folderRename(oldFolder: string, newFolder: string): Promise<void> {
        let slashFolder = oldFolder + "/";
        if (this.directories) {
            let newDirs: string[] = [];
            for (let dir of this.directories) {
                if (dir == oldFolder || dir.startsWith(slashFolder)) {
                    let newDirName = newFolder;
                    if (dir.indexOf("/") > -1) {
                        newDirName = FileUtil.combine(dir.substring(0, dir.lastIndexOf("/")), newFolder);
                    }
                    newDirs.push(newDirName);
                } else {
                    newDirs.push(dir);
                }
            }
            this.directories = newDirs;
        }
        if (this.items) {
            for (let item of this.items) {
                await item.folderRename(oldFolder, newFolder);
            }
        }
        await this.save();
    }

    public async deleteFolder(folder: string): Promise<void> {
        let slashFolder = folder + "/";
        if (this.directories) {
            let newDirs: string[] = [];
            for (let dir of this.directories) {
                if (dir != folder && !dir.startsWith(slashFolder)) {
                    newDirs.push(dir);
                }
            }
            this.directories = newDirs;
        }
        if (this.items) {
            let newItems: UserWorkspaceItem[] = [];
            for (let item of this.items) {
                if (item.path.startsWith(slashFolder)) {
                    await UserWorkspaceItem.remove(item);
                } else {
                    newItems.push(item);
                }
            }
            this.items = newItems;
        }
        await this.save();
    }
}