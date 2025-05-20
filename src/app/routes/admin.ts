import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Log, ActionType } from '../entities/Log';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const logRepository = AppDataSource.getRepository(Log);

// Get monitored users
router.get('/monitored-users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const monitoredUsers = await userRepository.find({
            where: { isMonitored: true },
            relations: ['role']
        });

        res.json(monitoredUsers.map(user => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role.name,
            lastLoginAt: user.lastLoginAt
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monitored users' });
    }
});

// Get user activity logs
router.get('/user-logs/:userId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const logs = await logRepository.find({
            where: { user: { id: Number(req.params.userId) } },
            order: { timestamp: 'DESC' },
            take: 100 // Limit to last 100 logs
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user logs' });
    }
});

// Get suspicious activity summary
router.get('/suspicious-activity', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const timeWindow = 5 * 60 * 1000; // 5 minutes
        const threshold = 50; // Suspicious threshold

        const suspiciousUsers = await userRepository
            .createQueryBuilder('user')
            .leftJoin('user.logs', 'log')
            .where('log.timestamp >= :timeWindow', { timeWindow: new Date(Date.now() - timeWindow) })
            .groupBy('user.id')
            .having('COUNT(log.id) >= :threshold', { threshold })
            .getMany();

        res.json(suspiciousUsers.map(user => ({
            id: user.id,
            email: user.email,
            isMonitored: user.isMonitored
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching suspicious activity' });
    }
});

// Get recent activity logs
router.get('/activity-logs', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const logs = await logRepository.find({
            relations: ['user'],
            order: { timestamp: 'DESC' },
            take: 100 // Limit to last 100 logs
        });

        res.json(logs.map(log => ({
            timestamp: log.timestamp,
            user: {
                email: log.user.email,
                firstName: log.user.firstName,
                lastName: log.user.lastName
            },
            action: log.action,
            entityType: log.entityType,
            details: log.details
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activity logs' });
    }
});

// Optimized hotel booking stats endpoint
router.get('/hotel-booking-stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const hotelRepo = AppDataSource.getRepository('Hotel');
        const hotels = await hotelRepo
            .createQueryBuilder('hotel')
            .leftJoinAndSelect('hotel.bookings', 'booking')
            .loadRelationCountAndMap('hotel.bookingCount', 'hotel.bookings')
            .orderBy('hotel_bookingCount', 'DESC')
            .getMany();
        res.json(hotels.map(hotel => ({
            id: hotel.id,
            name: hotel.name,
            location: hotel.location,
            bookingCount: (hotel as any).bookingCount
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hotel booking stats' });
    }
});

export default router; 