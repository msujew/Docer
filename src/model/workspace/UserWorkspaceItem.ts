import { PrimaryColumn, Column, Entity, BaseEntity } from "typeorm";

@Entity()
export default class UserWorkspaceItem extends BaseEntity {

    @PrimaryColumn()
    public path: string = "";

    @PrimaryColumn()
    public user: string = "";

    @Column("blob")
    public content: Buffer | undefined;
}