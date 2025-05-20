import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Role } from "./Role";
import { Log } from "./Log";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @ManyToOne(() => Role, role => role.users)
    role!: Role;

    @OneToMany(() => Log, log => log.user)
    logs!: Log[];

    @Column({ default: false })
    isMonitored!: boolean;

    @Column({ type: 'datetime', nullable: true })
    lastLoginAt!: Date;
}
