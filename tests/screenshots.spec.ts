import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:4200';
const SCREENSHOTS_DIR = 'screenshots';

// Routes accessible without authentication
const publicRoutes = [
  { path: '/',              name: 'home' },
  { path: '/auth/login',    name: 'auth-login' },
  { path: '/auth/register', name: 'auth-register' },
];

// Routes that require auth — will show redirect to login
const protectedRoutes = [
  { path: '/onboarding',        name: 'onboarding' },
  { path: '/profile',           name: 'profile' },
  // Client
  { path: '/client/orders',     name: 'client-orders' },
  { path: '/client/orders/new', name: 'client-orders-new' },
  // Master
  { path: '/master/orders',     name: 'master-orders' },
  { path: '/master/responses',  name: 'master-responses' },
  // Admin
  { path: '/admin/users',       name: 'admin-users' },
  { path: '/admin/work-types',  name: 'admin-work-types' },
  { path: '/admin/complaints',  name: 'admin-complaints' },
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function screenshot(page: any, route: { path: string; name: string }) {
  await page.goto(`${BASE_URL}${route.path}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${route.name}.png`),
    fullPage: true,
  });
}

test.beforeAll(() => {
  ensureDir(SCREENSHOTS_DIR);
});

test('public pages', async ({ page }) => {
  for (const route of publicRoutes) {
    await screenshot(page, route);
  }
});

test('protected pages (unauthenticated — shows redirect)', async ({ page }) => {
  for (const route of protectedRoutes) {
    await screenshot(page, route);
  }
});
