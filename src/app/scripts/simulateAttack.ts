import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Log, ActionType } from "../entities/Log";
import { Role } from "../entities/Role";

const simulateAttack = async () => {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);
    const logRepository = AppDataSource.getRepository(Log);
    const roleRepository = AppDataSource.getRepository(Role);

    // Create a test user
    const userRole = await roleRepository.findOne({ where: { name: 'USER' } });
    if (!userRole) {
        console.error('User role not found');
        return;
    }

    const attacker = await userRepository.save({
        email: 'attacker5@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Attacker',
        role: userRole
    });

    console.log('Created test user:', attacker.email);

    // Simulate rapid CRUD operations
    const operations = 100; // Number of operations to perform
    const delay = 100; // Delay between operations in ms

    for (let i = 0; i < operations; i++) {
        await logRepository.save({
            user: attacker,
            action: ActionType.CREATE,
            entityType: 'Test',
            entityId: i,
            details: `Simulated attack operation ${i + 1}`
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Performed operation ${i + 1}/${operations}`);
    }

    console.log('Attack simulation completed');
    await AppDataSource.destroy();
};

simulateAttack().catch(console.error); 