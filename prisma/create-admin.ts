import prisma from '../src/prisma';
import * as bcrypt from 'bcrypt';


async function main() {
    console.log('Starting admin user creation...');

    try {
        await prisma.$connect();
        console.log('Connected to database');

        // Get admin role
        const adminRole = await prisma.role.findUnique({
            where: { name: 'SUPER_ADMIN' },
        });

        if (!adminRole) {
            throw new Error('SUPER_ADMIN role not found');
        }

        // Check if admin user already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'superadmin@scholarity.com' },
        });

        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('Admin123!', 10);

        const admin = await prisma.user.create({
            data: {
                email: 'superadmin@scholarity.com',
                password: hashedPassword,
                name: 'Super Admin',
                roleId: adminRole.id,
                isActive: true,
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email: superadmin@scholarity.com');
        console.log('Password: Admin123!');

    } catch (e) {
        console.error('Error creating admin user:', e);
        throw e;
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
});
