import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Hotel } from "../entities/Hotel";

export const hotelRouter = Router();
const hotelRepository = AppDataSource.getRepository(Hotel);

// Define the /revenue endpoint
hotelRouter.get("/revenue", async (req, res) => {
  try {
    const result = await hotelRepository
      .createQueryBuilder("hotel")
      .leftJoinAndSelect("hotel.bookings", "booking")
      .select("hotel.id", "hotelId")
      .addSelect("hotel.name", "hotelName")
      .addSelect("SUM(booking.price)", "totalRevenue")
      .groupBy("hotel.id")
      .getRawMany();

    res.json(result);
  } catch (error) {
    console.error("Error fetching revenue:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});