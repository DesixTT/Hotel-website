import { AppDataSource } from "../data-source";
import { Log } from "../entities/Log";
import { User } from "../entities/User";
import { ActionType } from "../entities/Log";
import { MoreThanOrEqual } from "typeorm";

export class MonitoringService {
    private static instance: MonitoringService;
    private isRunning: boolean = false;
    private readonly SUSPICIOUS_THRESHOLD = 50; // Number of actions in time window
    private readonly TIME_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

    private constructor() {}

    public static getInstance(): MonitoringService {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }

    public async startMonitoring(): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;

        while (this.isRunning) {
            try {
                await this.analyzeLogs();
                await new Promise(resolve => setTimeout(resolve, 60000)); // Check every minute
            } catch (error) {
                console.error('Error in monitoring service:', error);
            }
        }
    }

    public stopMonitoring(): void {
        this.isRunning = false;
    }

    private async analyzeLogs(): Promise<void> {
        const logRepository = AppDataSource.getRepository(Log);
        const userRepository = AppDataSource.getRepository(User);

        // Get all users
        const users = await userRepository.find();

        for (const user of users) {
            // Count actions in the time window
            const actionCount = await logRepository.count({
                where: {
                    user: { id: user.id },
                    timestamp: MoreThanOrEqual(new Date(Date.now() - this.TIME_WINDOW_MS))
                }
            });

            // If suspicious activity detected
            if (actionCount >= this.SUSPICIOUS_THRESHOLD) {
                console.log(`Suspicious activity detected for user ${user.email}`);
                
                // Mark user as monitored
                user.isMonitored = true;
                await userRepository.save(user);

                // Log the detection
                await logRepository.save({
                    user,
                    action: ActionType.CREATE,
                    entityType: 'User',
                    entityId: user.id,
                    details: `User marked as monitored due to ${actionCount} actions in ${this.TIME_WINDOW_MS/1000/60} minutes`
                });
            }
        }
    }
} 