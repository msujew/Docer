import { BaseEntity, Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import * as FileUtil from "../../util/FileUtil";
import User from "./User";
import UserWorkspaceItem from "./UserWorkspaceItem";

@Entity()
@Index(["user", "name"])
export default class UserWorkspace extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id?: number;

    @ManyToOne((_type) => User)
    public user?: User;

    @Column()
    public name: string = "";

    @OneToMany((_type) => UserWorkspaceItem, (item) => item.workspace, { onDelete: "CASCADE" })
    public items?: UserWorkspaceItem[];

    public files: string[] = [];

    @Column("simple-array")
    public directories?: string[];

    public constructor(name: string, user: User) {
        super();
        this.name = name;
        this.user = user;
        this.directories = [];
    }

    public async folderRename(oldFolder: string, newFolder: string): Promise<void> {
        const slashFolder = oldFolder + "/";
        if (this.directories) {
            const newDirs: string[] = [];
            for (const dir of this.directories) {
                if (dir === oldFolder || dir.startsWith(slashFolder)) {
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
            for (const item of this.items) {
                await item.folderRename(oldFolder, newFolder);
            }
        }
        await this.save();
    }

    public async deleteFolder(folder: string): Promise<void> {
        const slashFolder = folder + "/";
        if (this.directories) {
            const newDirs: string[] = [];
            for (const dir of this.directories) {
                if (dir !== folder && !dir.startsWith(slashFolder)) {
                    newDirs.push(dir);
                }
            }
            this.directories = newDirs;
        }
        if (this.items) {
            const newItems: UserWorkspaceItem[] = [];
            for (const item of this.items) {
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
