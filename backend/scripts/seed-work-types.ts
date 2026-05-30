import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const WORK_TYPES = [
  { name: 'Укладка плитки', slug: 'tile_laying' },
  { name: 'Малярные работы', slug: 'painting' },
  { name: 'Покраска стен и потолка', slug: 'wall_ceiling_painting' },
  { name: 'Поклейка обоев', slug: 'wallpapering' },
  { name: 'Штукатурка и шпаклёвка', slug: 'plastering' },
  { name: 'Стяжка пола', slug: 'floor_screed' },
  { name: 'Укладка ламината / паркета', slug: 'flooring' },
  { name: 'Натяжные потолки', slug: 'stretch_ceiling' },
  { name: 'Электромонтажные работы', slug: 'electrical' },
  { name: 'Сантехника', slug: 'plumbing' },
  { name: 'Установка плинтусов', slug: 'skirting_boards' },
  { name: 'Установка дверей и окон', slug: 'doors_windows' },
  { name: 'Монтаж карнизов', slug: 'cornices' },
  { name: 'Сборка мебели', slug: 'furniture_assembly' },
  { name: 'Укладка кирпича', slug: 'bricklaying' },
  { name: 'Фундаментные работы', slug: 'foundation' },
  { name: 'Кровельные работы', slug: 'roofing' },
  { name: 'Общестроительные работы', slug: 'general_construction' },
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
