import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Role } from "../entities/Role";

const setAdmin = async () => {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    // Get admin role
    const adminRole = await roleRepository.findOne({ where: { name: 'ADMIN' } });
    if (!adminRole) {
        console.error('Admin role not found');
        return;
    }

    // Find user
    const user = await userRepository.findOne({ 
        where: { email: 'admin@example.com' },
        relations: ['role']
    });

    if (!user) {
        console.error('User not found');
        return;
    }

    // Update user role
    user.role = adminRole;
    await userRepository.save(user);

    console.log('User updated to admin role successfully');
    await AppDataSource.destroy();
};

setAdmin().catch(console.error); 