import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Booking } from "./Booking";

@Entity()
export class Hotel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    location!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price!: number;

    @Column()
    totalRooms!: number;

    @Column()
    availableRooms!: number;

    @OneToMany(() => Booking, booking => booking.hotel)
    bookings!: Booking[];
} 