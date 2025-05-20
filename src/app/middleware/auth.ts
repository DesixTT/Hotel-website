import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Log, ActionType } from '../entities/Log';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ 
            where: { id: decoded.userId },
            relations: ['role']
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Log the request
        const logRepository = AppDataSource.getRepository(Log);
        await logRepository.save({
            user,
            action: ActionType.READ,
            entityType: 'Request',
            entityId: 0,
            details: `${req.method} ${req.path}`
        });

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Reload user with role to ensure we have the latest data
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: req.user.id },
            relations: ['role']
        });

        if (!user || user.role.name !== 'ADMIN') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        req.user = user; // Update the request user with the loaded role
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({ message: 'Error checking admin access' });
    }
};

export const goldTierMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role.name !== 'GOLD' && req.user.role.name !== 'ADMIN')) {
        return res.status(403).json({ message: 'Gold tier access required' });
    }
    next();
};

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (userId: number): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}; 