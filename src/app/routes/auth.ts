import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Log, ActionType } from '../entities/Log';
import { hashPassword, comparePasswords, generateToken, authMiddleware, goldTierMiddleware } from '../middleware/auth';

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const roleRepository = AppDataSource.getRepository(Role);
const logRepository = AppDataSource.getRepository(Log);

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Check if user exists
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Get regular user role
        const userRole = await roleRepository.findOne({ where: { name: 'USER' } });
        if (!userRole) {
            return res.status(500).json({ message: 'User role not found' });
        }

        // Create user
        const hashedPassword = await hashPassword(password);
        const user = userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: userRole
        });

        await userRepository.save(user);

        // Log the registration
        await logRepository.save({
            user,
            action: ActionType.CREATE,
            entityType: 'User',
            entityId: user.id,
            details: 'User registered'
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user with role relation
        const user = await userRepository.findOne({ 
            where: { email },
            relations: ['role']  // Make sure role is loaded
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        user.lastLoginAt = new Date();
        await userRepository.save(user);

        // Generate token
        const token = generateToken(user.id);

        // Log the login
        await logRepository.save({
            user,
            action: ActionType.READ,
            entityType: 'User',
            entityId: user.id,
            details: 'User logged in'
        });

        // Return user info including role
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Upgrade to Gold Tier
router.post('/upgrade-to-gold', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const goldRole = await roleRepository.findOne({ where: { name: 'GOLD' } });
        
        if (!goldRole) {
            return res.status(500).json({ message: 'Gold role not found' });
        }

        user.role = goldRole;
        await userRepository.save(user);

        // Log the upgrade
        await logRepository.save({
            user,
            action: ActionType.UPDATE,
            entityType: 'User',
            entityId: user.id,
            details: 'User upgraded to Gold tier'
        });

        res.json({ message: 'Successfully upgraded to Gold tier' });
    } catch (error) {
        res.status(500).json({ message: 'Error upgrading to Gold tier' });
    }
});

// Gold tier exclusive features
router.get('/gold-features', authMiddleware, goldTierMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Example gold tier features
        const goldFeatures = {
            exclusiveDiscounts: true,
            priorityBooking: true,
            specialAmenities: [
                'Complimentary breakfast',
                'Late checkout',
                'Room upgrade priority',
                'Spa access'
            ],
            loyaltyPoints: 1000
        };

        res.json(goldFeatures);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gold features' });
    }
});

// Admin Registration (Special endpoint)
router.post('/register-admin', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Check if user exists
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Get admin role
        const adminRole = await roleRepository.findOne({ where: { name: 'ADMIN' } });
        if (!adminRole) {
            return res.status(500).json({ message: 'Admin role not found' });
        }

        // Create admin user
        const hashedPassword = await hashPassword(password);
        const user = userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: adminRole
        });

        await userRepository.save(user);

        // Log the registration
        await logRepository.save({
            user,
            action: ActionType.CREATE,
            entityType: 'User',
            entityId: user.id,
            details: 'Admin user registered'
        });

        res.status(201).json({ message: 'Admin user registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering admin user' });
    }
});

export default router; 