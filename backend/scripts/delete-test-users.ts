import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminIds = await prisma.profile.findMany({
    where: { isAdmin: true },
    select: { id: true },
  });

  const adminIdList = adminIds.map((p) => p.id);
  console.log(`Admins to keep: ${adminIdList.length}`);

  const result = await prisma.user.deleteMany({
    where: { id: { notIn: adminIdList } },
  });

  console.log(`Deleted ${result.count} user(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
