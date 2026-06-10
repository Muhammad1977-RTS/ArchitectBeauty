import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx ts-node scripts/make-admin.ts <email>');
  process.exit(1);
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as any);

  const user = await prisma.user.findFirst({
    where: { email },
    include: { profile: true },
  });

  if (!user) {
    console.error(`User with email "${email}" not found.`);
    await prisma.$disconnect();
    process.exit(1);
  }

  await prisma.profile.update({
    where: { id: user.id },
    data: { isAdmin: true },
  });

  console.log(`✓ ${email} is now admin.`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
