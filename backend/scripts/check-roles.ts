import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const EXPECTED: Record<string, string> = {
  'm22805616@gmail.com':   'client',
  'm22850616@gmail.com':   'master',
  'ramzanzanzan999@gmail.com': 'carrier',
  'abdtak886@gmail.com':   'store',
  'saydmohmad029@gmail.com': 'client',  // admin is still 'client' role
};

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as any);

  for (const [email, expectedRole] of Object.entries(EXPECTED)) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      console.log(`✗ ${email} — NOT FOUND`);
      continue;
    }

    const actual = user.profile?.role ?? '(no profile)';
    const ok = actual === expectedRole;
    if (ok) {
      console.log(`✓ ${email} — ${actual}`);
    } else {
      console.log(`✗ ${email} — actual: ${actual}, expected: ${expectedRole}  → fixing...`);
      await prisma.profile.update({
        where: { id: user.id },
        data: { role: expectedRole },
      });
      console.log(`  ✓ Fixed to ${expectedRole}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
