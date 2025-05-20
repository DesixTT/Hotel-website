import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "your_username", // Replace with your DB username
  password: "your_password", // Replace with your DB password
  database: "hotel_website", // Replace with your DB name
  synchronize: true, // Automatically sync schema (disable in production)
  logging: true,
  entities: ["src/entities/*.ts"], // Path to your entity files
});