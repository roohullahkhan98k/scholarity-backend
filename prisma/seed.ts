import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  console.log('Starting seed...');
  console.log('Direct URL available:', !!process.env.DIRECT_URL);

  // Use DIRECT_URL for seeding (bypasses connection pooler)
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log('Connected to database');

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
    await pool.end();
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
