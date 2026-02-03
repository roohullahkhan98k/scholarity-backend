import prisma from '../src/prisma';
import * as bcrypt from 'bcrypt';
import { CourseStatus, LessonType } from '@prisma/client';

async function main() {
    console.log('🚀 Starting Master Database Seed...');

    // 0. Clear Data
    console.log('🧹 Clearing existing data...');
    // We use a transaction to delete in order or rely on cascading
    await prisma.courseLog.deleteMany();
    await prisma.lessonProgress.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.unit.deleteMany();
    await prisma.course.deleteMany();
    await prisma.academicRequest.deleteMany();
    await prisma.instructorApplication.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.academicCategory.deleteMany();

    // 1. Roles & Permissions (RBAC)
    console.log('👥 Seeding RBAC...');
    const roles = ['SUPER_ADMIN', 'teacher', 'student', 'admin'];
    const permissions = [
        'MANAGE_USERS', 'MANAGE_ROLES', 'APPROVE_STAFF', 'MANAGE_ACADEMIC',
        'MANAGE_COURSES', 'APPROVE_COURSE', 'VIEW_REPORTS', 'CREATE_COURSE',
        'VIEW_COURSE', 'ENROLL_COURSE',
    ];

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm },
            update: {},
            create: { name: perm },
        });
    }

    const createdRoles: any = {};
    for (const roleName of roles) {
        createdRoles[roleName] = await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        });
    }

    // Grant all perms to SUPER_ADMIN
    const allPerms = await prisma.permission.findMany();
    await prisma.role.update({
        where: { name: 'SUPER_ADMIN' },
        data: { permissions: { connect: allPerms.map(p => ({ id: p.id })) } }
    });

    // 2. Create Super Admin
    console.log('👑 Creating Super Admin...');
    const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
    await prisma.user.upsert({
        where: { email: 'superadmin@scholarity.com' },
        update: {},
        create: {
            email: 'superadmin@scholarity.com',
            password: hashedAdminPassword,
            name: 'Super Admin',
            roleId: createdRoles['SUPER_ADMIN'].id,
            isActive: true,
        }
    });

    // 3. Create Teacher
    console.log('👨‍🏫 Creating Teacher...');
    const hashedTeacherPassword = await bcrypt.hash('Teacher123!', 10);
    const teacherUser = await prisma.user.upsert({
        where: { email: 'teacher@scholarity.com' },
        update: {},
        create: {
            email: 'teacher@scholarity.com',
            password: hashedTeacherPassword,
            name: 'Robert C. Martin',
            roleId: createdRoles['teacher'].id,
            isActive: true,
            teacher: {
                create: {
                    bio: 'Experienced software craftsman and author of Clean Code.',
                    expertise: 'Software Architecture, Clean Code',
                    experience: '40+ years',
                }
            }
        },
        include: { teacher: true }
    });
    const teacherId = teacherUser.teacher!.id;

    // 4. Academic Content
    console.log('📚 Seeding Academic Categories & Subjects...');
    const academicData = [
        { name: 'Computer Science', subjects: ['Algorithms', 'Data Structures', 'Database Systems', 'Web Development'] },
        { name: 'Business', subjects: ['Marketing', 'Finance', 'Management', 'Entrepreneurship'] },
        { name: 'Physics', subjects: ['Classical Mechanics', 'Quantum Physics', 'Thermodynamics'] },
        { name: 'Mathematics', subjects: ['Calculus', 'Linear Algebra', 'Statistics'] },
    ];

    for (const catData of academicData) {
        const category = await prisma.academicCategory.upsert({
            where: { name: catData.name },
            update: {},
            create: { name: catData.name }
        });

        for (const subName of catData.subjects) {
            const subject = await prisma.subject.upsert({
                where: { name_categoryId: { name: subName, categoryId: category.id } },
                update: {},
                create: {
                    name: subName,
                    categoryId: category.id
                }
            });

            // 5. Seed Courses for each subject
            console.log(`🎬 Creating courses for ${subName}...`);

            // Delete old courses for this subject to avoid duplication if running seed multiple times
            await prisma.course.deleteMany({
                where: { title: `Mastering ${subName}` }
            });

            await prisma.course.create({
                data: {
                    title: `Mastering ${subName}`,
                    description: `A comprehensive guide to ${subName} for all levels. Dive deep into core principles, practical applications, and advanced techniques.`,
                    duration: 1200,
                    price: 49.99,
                    status: CourseStatus.APPROVED,
                    teacherId,
                    categoryId: category.id,
                    subjectId: subject.id,
                    units: {
                        create: [
                            {
                                title: 'Unit 1: Fundamentals',
                                order: 1,
                                lessons: {
                                    create: [
                                        {
                                            title: `Introduction to ${subName}`,
                                            duration: 15,
                                            order: 1,
                                            videoUrl: 'uploads/demo.mp4',
                                            type: LessonType.VIDEO
                                        },
                                        {
                                            title: 'Key Concepts & Definitions',
                                            duration: 20,
                                            order: 2,
                                            type: LessonType.DOCUMENT
                                        }
                                    ]
                                }
                            },
                            {
                                title: 'Unit 2: Advanced Topics',
                                order: 2,
                                lessons: {
                                    create: [
                                        {
                                            title: 'Deep Dive',
                                            duration: 45,
                                            order: 1,
                                            type: LessonType.VIDEO
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            });
        }
    }

    console.log('✨ Master Seeding Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
