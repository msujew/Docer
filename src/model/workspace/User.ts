import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Index } from "typeorm";
import UserWorkspace from "./UserWorkspace";

@Entity()
export default class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column()
    @Index({ unique: true })
    public name: string = "";

    @Column()
    public password: string = "";

    @OneToMany((_type) => UserWorkspace, (workspace) => workspace.user, { onDelete: "CASCADE" })
    public workspaces?: UserWorkspace[];
}
