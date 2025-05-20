import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm";
import { Booking } from "./Booking";

@Entity()
export class Hotel {
    @PrimaryGeneratedColumn()
    id!: number;
    @Index()
    @Column()
    name!: string;

    @Column()
    location!: string;

    @OneToMany(() => Booking, booking => booking.hotel)
    bookings!: Booking[];
} 