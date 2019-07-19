import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn } from "typeorm";
import User from "./User";

@Entity()
export default class UserSession extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number | undefined;

    @Column()
    public token: string = "";

    @OneToOne(_type => User)
    @JoinColumn()
    public user: User | undefined;
}