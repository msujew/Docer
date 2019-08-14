import { BaseEntity, Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

    public constructor(name: string, user: User) {
        super();
        this.name = name;
        this.user = user;
    }

    public async folderRename(oldFolder: string, newFolder: string): Promise<void> {
        if (this.items) {
            for (const item of this.items) {
                await item.folderRename(oldFolder, newFolder);
            }
        }
        await this.save();
    }

    public async deleteFolder(folder: string): Promise<void> {
        if (this.items) {
            const slashFolder = folder + "/";
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
