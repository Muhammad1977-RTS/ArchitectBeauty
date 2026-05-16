import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const WORK_TYPES = [
  { name: 'Укладка плитки', slug: 'tile_laying' },
  { name: 'Малярные работы', slug: 'painting' },
  { name: 'Поклейка обоев', slug: 'wallpapering' },
  { name: 'Электромонтажные работы', slug: 'electrical' },
  { name: 'Сантехника', slug: 'plumbing' },
  { name: 'Штукатурка и шпаклёвка', slug: 'plastering' },
  { name: 'Натяжные потолки', slug: 'stretch_ceiling' },
  { name: 'Укладка ламината / паркета', slug: 'flooring' },
  { name: 'Сборка мебели', slug: 'furniture_assembly' },
  { name: 'Другое', slug: 'other' },
];

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as any);

  for (const wt of WORK_TYPES) {
    await prisma.workType.upsert({
      where: { slug: wt.slug },
      update: { name: wt.name },
      create: wt,
    });
    console.log(`✓ ${wt.name}`);
  }

  console.log('\nГотово — добавлено видов работ:', WORK_TYPES.length);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
