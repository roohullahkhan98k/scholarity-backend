import prisma from '../src/prisma';

async function main() {
    console.log('🌱 Seeding Academic Categories & Subjects...');

    // Academic Categories & Subjects
    const academicData = [
        {
            name: '11th Class',
            subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
        },
        {
            name: '12th Class',
            subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
        },
        {
            name: 'Undergraduate (UG)',
            subjects: ['Computer Applications', 'Business Administration', 'Economics', 'Political Science'],
        },
        {
            name: 'Postgraduate (PG)',
            subjects: ['Advanced Computing', 'MBA', 'Microbiology'],
        },
    ];

    for (const categoryData of academicData) {
        const category = await prisma.academicCategory.upsert({
            where: { name: categoryData.name },
            update: {},
            create: { name: categoryData.name },
        });

        console.log(`✅ Category: ${category.name}`);

        for (const subjectName of categoryData.subjects) {
            const subject = await prisma.subject.upsert({
                where: {
                    name_categoryId: {
                        name: subjectName,
                        categoryId: category.id,
                    },
                },
                update: {},
                create: {
                    name: subjectName,
                    categoryId: category.id,
                },
            });
            console.log(`   - Subject: ${subject.name}`);
        }
    }

    console.log('✨ Academic Seeding Complete');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
