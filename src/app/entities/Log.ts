import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

export enum ActionType {
    CREATE = "CREATE",
    READ = "READ",
    UPDATE = "UPDATE",
    DELETE = "DELETE"
}

@Entity()
export class Log {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.logs)
    user!: User;

    @Column({
        type: "text",
        enum: ActionType
    })
    action!: ActionType;

    @Column()
    entityType!: string;

    @Column()
    entityId!: number;

    @Column({ type: 'text', nullable: true })
    details!: string;

    @CreateDateColumn()
    timestamp!: Date;
} 