import { Entity, PrimaryColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class UserWorkspace extends BaseEntity {

    @PrimaryColumn()
    public user: string = "";

    @Column("simple-array")
    public files: string[] | undefined;

    @Column("simple-array")
    public directores: string[] | undefined;
}