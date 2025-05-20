// filepath: d:\Salvate din C\hotel-website\src\app\entities\Booking.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from "typeorm";
import { Hotel } from "./Hotel";

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  roomName!: string;

  @Index() // Add index for faster queries
  @Column("decimal")
  price!: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.bookings, { onDelete: "CASCADE" })
  hotel!: Hotel;
}