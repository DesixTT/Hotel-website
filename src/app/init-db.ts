import { AppDataSource } from "./data-source";

const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database initialized successfully!");
        await AppDataSource.destroy();
        console.log("Database connection closed!");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

initializeDatabase(); 