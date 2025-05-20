import { AppDataSource } from "./data-source";
import { Hotel } from "./entities/Hotel";
import { Booking } from "./entities/Booking";
import { faker } from "@faker-js/faker";
import { Router } from "express";

export const hotelRouter = Router();
const hotelRepository = AppDataSource.getRepository(Hotel);

hotelRouter.get("/revenue", async (req, res) => {
  const result = await hotelRepository
    .createQueryBuilder("hotel")
    .leftJoinAndSelect("hotel.bookings", "booking")
    .select("hotel.id", "hotelId")
    .addSelect("hotel.name", "hotelName")
    .addSelect("SUM(booking.price)", "totalRevenue")
    .groupBy("hotel.id")
    .getRawMany();

  res.json(result);
});

const seedDatabase = async () => {
  await AppDataSource.initialize();
  console.log("Database connected!");

  const bookingRepository = AppDataSource.getRepository(Booking);

  // Generate 100,000 hotels
  const hotels = [];
  for (let i = 0; i < 100000; i++) {
    const hotel = hotelRepository.create({
      name: faker.company.name(),
      location: faker.address.city(),
    });
    hotels.push(hotel);
  }
  await hotelRepository.save(hotels);
  console.log("100,000 hotels inserted!");

  // Generate 100,000 bookings
  const bookings = [];
  for (let i = 0; i < 100000; i++) {
    const booking = bookingRepository.create({
      roomName: faker.word.noun(), // Use faker.word.noun() instead of faker.random.word()
      price: parseFloat(faker.commerce.price()),
      hotel: hotels[Math.floor(Math.random() * hotels.length)], // Randomly assign a hotel
    });
    bookings.push(booking);
  }
  await bookingRepository.save(bookings);
  console.log("100,000 bookings inserted!");

  await AppDataSource.destroy();
  console.log("Database connection closed!");
};

seedDatabase().catch((error) => console.error("Error seeding database:", error));