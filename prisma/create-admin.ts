import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting admin user creation...');

    try {
        await prisma.$connect();
        console.log('Connected to database');

        // Get admin role
        const adminRole = await prisma.role.findUnique({
            where: { name: 'admin' },
        });

        if (!adminRole) {
            throw new Error('Admin role not found');
        }

        // Check if admin user already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@scholarity.com' },
        });

        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('Admin123!', 10);

        const admin = await prisma.user.create({
            data: {
                email: 'admin@scholarity.com',
                password: hashedPassword,
                name: 'Admin User',
                roleId: adminRole.id,
                isActive: true,
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@scholarity.com');
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
