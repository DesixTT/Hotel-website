import "reflect-metadata";
import { DataSource } from "typeorm";
import { Hotel } from "./entities/Hotel";
import { Booking } from "./entities/Booking";
import { Role } from "./entities/Role";
import { User } from "./entities/User";
import { Log } from "./entities/Log";
import path from "path";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: path.join(__dirname, "../../database/hotel.db"),
    synchronize: true,
    logging: true,
    entities: [Hotel, Booking, Role, User, Log],
    migrations: [],
    subscribers: [],
}); 