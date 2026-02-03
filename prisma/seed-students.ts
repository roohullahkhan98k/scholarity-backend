import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed for students and instructor applications...');

    try {
        await prisma.$connect();
        console.log('Connected to database');

        // Get student role
        const studentRole = await prisma.role.findUnique({
            where: { name: 'student' },
        });

        if (!studentRole) {
            throw new Error('Student role not found');
        }

        const hashedPassword = await bcrypt.hash('Student123!', 10);

        // Create 5 students with pending instructor applications
        console.log('\n📝 Creating 5 students with pending instructor applications...');
        for (let i = 1; i <= 5; i++) {
            const student = await prisma.user.create({
                data: {
                    email: `teacher-applicant${i}@scholarity.com`,
                    password: hashedPassword,
                    name: `Teacher Applicant ${i}`,
                    roleId: studentRole.id,
                    isActive: true,
                },
            });

            // Create student profile
            await prisma.student.create({
                data: {
                    userId: student.id,
                    bio: `Aspiring teacher with passion for education. Application ${i}`,
                    interests: 'Teaching, Web Development, Programming',
                },
            });

            // Create instructor application
            await prisma.instructorApplication.create({
                data: {
                    userId: student.id,
                    bio: `I am a passionate educator with experience in software development. I have been coding for ${3 + i} years and want to share my knowledge with students.`,
                    expertise: `Web Development, JavaScript, React, Node.js${i % 2 === 0 ? ', TypeScript' : ', Python'}`,
                    experience: `${2 + i} years of professional development experience and ${i} year${i > 1 ? 's' : ''} of mentoring junior developers.`,
                    status: 'PENDING',
                },
            });

            console.log(`✅ Created: ${student.email} with pending application`);
        }

        // Create 5 regular students (no applications)
        console.log('\n👨‍🎓 Creating 5 regular students...');
        for (let i = 1; i <= 5; i++) {
            const student = await prisma.user.create({
                data: {
                    email: `student${i}@scholarity.com`,
                    password: hashedPassword,
                    name: `Student ${i}`,
                    roleId: studentRole.id,
                    isActive: true,
                },
            });

            // Create student profile
            await prisma.student.create({
                data: {
                    userId: student.id,
                    bio: `Eager learner interested in technology and programming. Student profile ${i}`,
                    interests: `${i % 3 === 0 ? 'AI, Machine Learning' : i % 2 === 0 ? 'Web Development, Design' : 'Mobile Development, Cloud Computing'}`,
                    enrolledCourses: i % 3,
                    completedCourses: i % 2,
                },
            });

            console.log(`✅ Created: ${student.email}`);
        }

        console.log('\n🎉 Seed completed successfully!');
        console.log('\n📊 Summary:');
        console.log('- 5 students with pending instructor applications');
        console.log('- 5 regular students');
        console.log('\n🔑 All students have password: Student123!');

    } catch (e) {
        console.error('Error during seeding:', e);
        throw e;
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
});
