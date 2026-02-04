import prisma from '../prisma';
import { CourseStatus } from '@prisma/client';

async function main() {
    console.log('🌱 Starting Course Seeding script...');

    // 1. Find the teacher (Searching for "Masters G" as requested)
    const teacherUser = await prisma.user.findFirst({
        where: {
            name: { contains: 'Robert C. Martin', mode: 'insensitive' }
        },
        include: { teacher: true }
    });

    if (!teacherUser || !teacherUser.teacher) {
        console.error('❌ Could not find teacher "Robert C. Martin". Please check the name in the database.');
        return;
    }

    console.log(`✅ Found Teacher: ${teacherUser.name} (Teacher ID: ${teacherUser.teacher.id})`);

    // 2. Find a category and subject (taking the first available)
    const category = await prisma.academicCategory.findFirst();
    const subject = await prisma.subject.findFirst();

    if (!category || !subject) {
        console.error('❌ Academic Categories or Subjects missing from database.');
        return;
    }

    console.log(`✅ Using Category: ${category.name}, Subject: ${subject.name}`);

    // 3. Define 10 courses
    const coursesToCreate = [
        { title: 'Intro to Quantum Computing', desc: 'Basics of qubits and gates.' },
        { title: 'Advanced Machine Learning', desc: 'Deep dive into transformers and RL.' },
        { title: 'Modern Web Development with Next.js', desc: 'Building high-performance SSR apps.' },
        { title: 'Financial Modeling for Startups', desc: 'Projecting cash flows and valuations.' },
        { title: 'Creative Writing Workshop', desc: 'Developing voice and story structure.' },
        { title: 'Cybersecurity Fundamentals', desc: 'Encryption, network security, and pentesting.' },
        { title: 'Data Structures and Algorithms', desc: 'Mastering the technical interview.' },
        { title: 'Digital Marketing Strategies', desc: 'SEO, SEM, and social media growth.' },
        { title: 'Mobile App Development with Flutter', 'desc': 'Cross-platform apps from one codebase.' },
        { title: 'Cloud Architecture & AWS', desc: 'Designing scalable cloud systems.' },
    ];

    console.log(`🚀 Creating 10 courses for ${teacherUser.name}...`);

    for (const c of coursesToCreate) {
        const newCourse = await prisma.course.create({
            data: {
                title: c.title,
                description: c.desc,
                price: Math.floor(Math.random() * 100) + 19,
                duration: Math.floor(Math.random() * 200) + 10,
                status: CourseStatus.DRAFT,
                teacherId: teacherUser.teacher.id,
                categoryId: category.id,
                subjectId: subject.id,
            }
        });
        console.log(`   - Added: ${newCourse.title}`);
    }

    console.log('✨ Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
