import { PrimaryColumn, Column, Entity, BaseEntity, OneToMany, ManyToOne, PrimaryGeneratedColumn, Index } from "typeorm";
import UserWorkspace from "./UserWorkspace";
import * as FileUtil from "../../util/FileUtil";

@Entity()
@Index(["workspace", "path"])
export default class UserWorkspaceItem extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number | undefined;

    @ManyToOne(_type => UserWorkspace)
    public workspace: UserWorkspace | undefined;

    @Column()
    public path: string = "";

    @Column("blob")
    public content: Buffer | undefined;

    public async folderRename(oldFolder: string, newFolder: string): Promise<void> {
        if (!oldFolder.endsWith("/")) {
            oldFolder += "/";
        }
        if (this.path.startsWith(oldFolder)) {
            let fileName = this.path.substring(this.path.lastIndexOf("/") + 1);
            this.path = FileUtil.combine(newFolder, fileName);
        }
        await this.save();
    }
}