import { test, type BrowserContext, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:4200';
const SCREENSHOTS_DIR = 'screenshots';
const AUTH_DIR = path.join('tests', '.auth');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function withAuth(
  context: BrowserContext,
  storageFile: string,
): Promise<Page> {
  await context.clearCookies();
  // Inject saved localStorage / cookies for the role
  const state = JSON.parse(fs.readFileSync(storageFile, 'utf-8'));
  if (state.origins) {
    for (const origin of state.origins) {
      for (const entry of origin.localStorage ?? []) {
        await context.addInitScript(
          ({ name, value }: { name: string; value: string }) => {
            localStorage.setItem(name, value);
          },
          { name: entry.name, value: entry.value },
        );
      }
    }
  }
  return context.newPage();
}

async function screenshot(
  page: Page,
  routePath: string,
  name: string,
): Promise<void> {
  await page.goto(`${BASE_URL}${routePath}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${name}.png`),
    fullPage: true,
  });
}

test.beforeAll(() => {
  ensureDir(SCREENSHOTS_DIR);
});

// ── Public pages (no auth needed) ─────────────────────────────────────────────

test('public pages', async ({ page }) => {
  await screenshot(page, '/', 'home');
  await screenshot(page, '/auth/login', 'auth-login');
  await screenshot(page, '/auth/register', 'auth-register');
});

// ── Client-role pages ──────────────────────────────────────────────────────────

test('client pages', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: path.join(AUTH_DIR, 'client.json'),
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await screenshot(page, '/profile', 'profile');
  await screenshot(page, '/onboarding', 'onboarding');
  await screenshot(page, '/client/orders', 'client-orders');
  await screenshot(page, '/client/orders/new', 'client-orders-new');

  await context.close();
});

// ── Master-role pages ──────────────────────────────────────────────────────────

test('master pages', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: path.join(AUTH_DIR, 'master.json'),
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await screenshot(page, '/master/orders', 'master-orders');
  await screenshot(page, '/master/responses', 'master-responses');

  await context.close();
});

// ── Admin pages ────────────────────────────────────────────────────────────────

test('admin pages', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: path.join(AUTH_DIR, 'admin.json'),
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await screenshot(page, '/admin/users', 'admin-users');
  await screenshot(page, '/admin/work-types', 'admin-work-types');
  await screenshot(page, '/admin/complaints', 'admin-complaints');

  await context.close();
});
