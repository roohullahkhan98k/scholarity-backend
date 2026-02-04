import prisma from '../prisma';

async function main() {
    const teachers = await prisma.user.findMany({
        where: {
            role: { name: { contains: 'teacher', mode: 'insensitive' } }
        },
        select: { id: true, name: true, email: true }
    });
    console.log('Teachers found:', JSON.stringify(teachers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
