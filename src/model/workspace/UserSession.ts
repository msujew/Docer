import { BaseEntity, Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./User";

@Entity()
export default class UserSession extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column()
    @Index({ unique: true})
    public token: string = "";

    @OneToOne((_type) => User)
    @JoinColumn()
    public user?: User;
}
