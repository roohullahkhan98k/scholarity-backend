import prisma from '../src/prisma';
import * as bcrypt from 'bcrypt';

async function createTeacher() {
    console.log('🚀 Starting teacher account creation...');

    try {
        const teacherRole = await prisma.role.findUnique({
            where: { name: 'TEACHER' }
        });

        if (!teacherRole) throw new Error('TEACHER role not found. Run migrations first.');

        const email = 'teacher@scholarity.com';
        const password = 'Teacher123!';

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log('💡 Teacher account already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Test Teacher',
                    roleId: teacherRole.id,
                    isActive: true,
                }
            });

            await tx.teacher.create({
                data: {
                    userId: user.id,
                    bio: 'Experienced educator for testing purposes.',
                    expertise: 'Mathematics and Computer Science',
                    experience: '5 years'
                }
            });
        });

        console.log('✅ Teacher account created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTeacher();
