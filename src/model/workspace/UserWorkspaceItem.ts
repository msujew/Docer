import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import * as FileUtil from "../../util/FileUtil";
import UserWorkspace from "./UserWorkspace";

@Entity()
@Index(["workspace", "path"])
export default class UserWorkspaceItem extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id?: number;

    @ManyToOne((_type) => UserWorkspace)
    public workspace?: UserWorkspace;

    @Column()
    public path: string = "";

    @Column({ type: "text", nullable: false, default: () => "CURRENT_TIMESTAMP" })
    public date?: string;

    @Column("blob")
    public content?: Buffer;

    public async folderRename(oldFolder: string, newFolder: string): Promise<void> {
        if (!oldFolder.endsWith("/")) {
            oldFolder += "/";
        }
        if (this.path.startsWith(oldFolder)) {
            const fileName = this.path.substring(this.path.lastIndexOf("/") + 1);
            this.path = FileUtil.combineNormalized(newFolder, fileName);
        }
        await this.save();
    }
}
