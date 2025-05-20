import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Hotel } from "./entities/Hotel";
import { Booking } from "./entities/Booking";
import { Role } from "./entities/Role";
import { User } from "./entities/User";
import { Log, ActionType } from "./entities/Log";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import { MonitoringService } from "./services/MonitoringService";
import path from "path";
import { FindOptionsWhere } from "typeorm";

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy' });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve admin dashboard
app.get('/admin', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

AppDataSource.initialize().then(async () => {
    // Initialize roles if they don't exist
    const roleRepository = AppDataSource.getRepository(Role);
    const adminRole = await roleRepository.findOne({ where: { name: 'ADMIN' } });
    const userRole = await roleRepository.findOne({ where: { name: 'USER' } });
    const goldRole = await roleRepository.findOne({ where: { name: 'GOLD' } });

    if (!adminRole) {
        await roleRepository.save({
            name: 'ADMIN',
            description: 'Administrator with full access'
        });
    }

    if (!userRole) {
        await roleRepository.save({
            name: 'USER',
            description: 'Regular user with limited access'
        });
    }

    if (!goldRole) {
        await roleRepository.save({
            name: 'GOLD',
            description: 'Gold tier member with premium benefits'
        });
    }

    // Start monitoring service
    const monitoringService = MonitoringService.getInstance();
    monitoringService.startMonitoring().catch(console.error);

    // Routes
    app.use('/auth', authRoutes);
    app.use('/api/admin', adminRoutes);

    const hotelRepo = AppDataSource.getRepository(Hotel);
    const bookingRepo = AppDataSource.getRepository(Booking);
    const logRepo = AppDataSource.getRepository(Log);

    // CRUD for Hotels
    app.post("/hotels", async (req: Request, res: Response) => {
        // Ensure req.body is a single object, not an array
        if (Array.isArray(req.body)) {
            return res.status(400).json({ error: "Only one hotel can be created at a time." });
        }
        const hotel = hotelRepo.create(req.body);
        const savedHotel = await hotelRepo.save(hotel);
        if (Array.isArray(savedHotel)) {
            return res.status(500).json({ error: "Unexpected array returned from save." });
        }
        const hotelObj = savedHotel as Hotel;

        // Log the action
        if (req.user) {
            const log = logRepo.create({
                user: req.user,
                action: ActionType.CREATE,
                entityType: 'Hotel',
                entityId: hotelObj.id,
                details: 'Hotel created'
            });
            await logRepo.save(log);
        }

        res.json(hotelObj);
    });

    app.get("/hotels", async (req: Request, res: Response) => {
        const { location, sortBy = "id", order = "ASC" } = req.query;
        const where: FindOptionsWhere<Hotel> = {};
        
        if (location) {
            where.location = String(location);
        }
        
        const hotels = await hotelRepo.find({
            where,
            order: { [String(sortBy)]: order === "DESC" ? "DESC" : "ASC" },
            relations: ["bookings"],
        });

        // Log the action
        if (req.user) {
            await logRepo.save({
                user: req.user,
                action: ActionType.READ,
                entityType: 'Hotel',
                entityId: 0,
                details: 'Hotels listed'
            });
        }

        res.json(hotels);
    });

    app.get("/hotels/:id", async (req: Request, res: Response) => {
        const hotel = await hotelRepo.findOne({
            where: { id: Number(req.params.id) },
            relations: ["bookings"],
        });
        res.json(hotel);
    });

    app.put("/hotels/:id", async (req: Request, res: Response) => {
        await hotelRepo.update(req.params.id, req.body);
        const updated = await hotelRepo.findOneBy({ id: Number(req.params.id) });
        res.json(updated);
    });

    app.delete("/hotels/:id", async (req: Request, res: Response) => {
        await hotelRepo.delete(req.params.id);
        res.json({ deleted: true });
    });

    // CRUD for Bookings
    app.post("/bookings", async (req: Request, res: Response) => {
        const booking = bookingRepo.create(req.body);
        await bookingRepo.save(booking);
        res.json(booking);
    });

    app.get("/bookings", async (req: Request, res: Response) => {
        const { guestName, sortBy = "id", order = "ASC" } = req.query;
        const where: FindOptionsWhere<Booking> = {};
        
        if (guestName) {
            where.guestName = String(guestName);
        }
        
        const bookings = await bookingRepo.find({
            where,
            order: { [String(sortBy)]: order === "DESC" ? "DESC" : "ASC" },
            relations: ["hotel"],
        });
        res.json(bookings);
    });

    app.get("/bookings/:id", async (req: Request, res: Response) => {
        const booking = await bookingRepo.findOne({
            where: { id: Number(req.params.id) },
            relations: ["hotel"],
        });
        res.json(booking);
    });

    app.put("/bookings/:id", async (req: Request, res: Response) => {
        await bookingRepo.update(req.params.id, req.body);
        const updated = await bookingRepo.findOneBy({ id: Number(req.params.id) });
        res.json(updated);
    });

    app.delete("/bookings/:id", async (req: Request, res: Response) => {
        await bookingRepo.delete(req.params.id);
        res.json({ deleted: true });
    });

    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}); 