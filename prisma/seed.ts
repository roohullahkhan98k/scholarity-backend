import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  try {
    const roles = ['admin', 'teacher', 'student'];

    for (const role of roles) {
      const upsertedRole = await prisma.role.upsert({
        where: { name: role },
        update: {},
        create: {
          name: role,
        },
      });
      console.log(`Upserted role: ${upsertedRole.name}`);
    }
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
