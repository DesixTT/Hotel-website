// filepath: d:\Salvate din C\hotel-website\src\app\entities\Booking.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from "typeorm";
import { Hotel } from "./Hotel";

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  guestName!: string;

  @Column()
  checkIn!: Date;

  @Column()
  checkOut!: Date;

  @Index() // Add index for faster queries
  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @ManyToOne(() => Hotel, hotel => hotel.bookings, { onDelete: "CASCADE" })
  hotel!: Hotel;
}