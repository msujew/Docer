import { Entity, PrimaryColumn, Column, BaseEntity } from "typeorm";

@Entity()
export default class User extends BaseEntity {

    @PrimaryColumn()
    public name: string = "";

    @Column()
    public password: string = "";
}