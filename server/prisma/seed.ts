import { PrismaClient } from '@prisma/client';
import { runDatabaseSeed } from '../src/utils/seedData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FoodRescue database seed...');
  await runDatabaseSeed(prisma);
  console.log('✅ Seed completed successfully with demo users, donations, and workflow records!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
