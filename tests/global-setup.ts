import { chromium, type FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.test' });

const BASE_URL = 'http://localhost:4200';
const AUTH_DIR = path.join('tests', '.auth');

async function saveAuthState(
  email: string,
  password: string,
  outFile: string,
): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/auth/login`);
  await page.waitForLoadState('networkidle');

  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');

  // Wait until we leave /auth/login (redirect to orders / profile / onboarding)
  await page.waitForURL(url => !url.pathname.includes('/auth/login'), {
    timeout: 15_000,
  });
  await page.waitForLoadState('networkidle');

  await context.storageState({ path: outFile });
  await browser.close();
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  const clientEmail = process.env['TEST_CLIENT_EMAIL'];
  const clientPassword = process.env['TEST_CLIENT_PASSWORD'];
  const masterEmail = process.env['TEST_MASTER_EMAIL'];
  const masterPassword = process.env['TEST_MASTER_PASSWORD'];
  const adminEmail = process.env['TEST_ADMIN_EMAIL'];
  const adminPassword = process.env['TEST_ADMIN_PASSWORD'];

  if (!clientEmail || !clientPassword || !masterEmail || !masterPassword || !adminEmail || !adminPassword) {
    throw new Error(
      'Missing test credentials in .env.test. ' +
      'Fill in TEST_CLIENT_EMAIL, TEST_CLIENT_PASSWORD, ' +
      'TEST_MASTER_EMAIL, TEST_MASTER_PASSWORD, ' +
      'TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD.',
    );
  }

  console.log('[global-setup] Logging in as client...');
  await saveAuthState(clientEmail, clientPassword, path.join(AUTH_DIR, 'client.json'));

  console.log('[global-setup] Logging in as master...');
  await saveAuthState(masterEmail, masterPassword, path.join(AUTH_DIR, 'master.json'));

  console.log('[global-setup] Logging in as admin...');
  await saveAuthState(adminEmail, adminPassword, path.join(AUTH_DIR, 'admin.json'));

  console.log('[global-setup] All sessions saved.');
}
