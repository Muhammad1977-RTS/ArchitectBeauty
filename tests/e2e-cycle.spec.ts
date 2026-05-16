import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = 'http://127.0.0.1:4200';
const AUTH_DIR = path.join('tests', '.auth');
const SNAP_DIR = path.join('screenshots', 'e2e-debug');

async function authPage(
  browser: Browser,
  role: string,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    storageState: path.join(AUTH_DIR, `${role}.json`),
    viewport: { width: 1440, height: 900 },
  });
  return { context, page: await context.newPage() };
}

function ensureDir(d: string) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

test('полный цикл: заявка → отклик → выбор → чат → завершение → оценка', async ({ browser }) => {
  test.setTimeout(120_000);
  ensureDir(SNAP_DIR);

  // ── Шаг 1: Клиент создаёт заявку ────────────────────────────────────────────
  const { context: clientCtx, page: client } = await authPage(browser, 'client');

  await client.goto(`${BASE_URL}/client/orders/new`);
  await client.waitForLoadState('networkidle');

  // Ждём пока виды работ загрузятся из API
  const workTypeSelect = client.locator('select[formcontrolname="work_type_id"]');
  await workTypeSelect.waitFor({ state: 'visible' });
  await client.waitForFunction(() => {
    const sel = document.querySelector('select[formcontrolname="work_type_id"]') as HTMLSelectElement;
    return sel && sel.options.length > 1;
  }, { timeout: 10_000 });
  await workTypeSelect.selectOption({ index: 1 });

  await client.fill('input[formcontrolname="area_sqm"]', '25');
  await client.fill('input[formcontrolname="address"]', 'Грозный, ул. Тестовая 1 (e2e-тест)');
  await client.click('button[type="submit"]:has-text("Создать заявку")');

  // Ждём редиректа на /client/orders/{uuid} — исключаем /new
  await client.waitForURL(
    url => url.pathname.startsWith('/client/orders/') && !url.pathname.endsWith('/new'),
    { timeout: 15_000 },
  );
  const orderId = client.url().split('/').pop()!;
  console.log('[e2e] orderId:', orderId);
  expect(orderId).toBeTruthy();
  expect(orderId).not.toBe('new');

  // ── Шаг 2: Мастер откликается ───────────────────────────────────────────────
  const { context: masterCtx, page: master } = await authPage(browser, 'master');

  await master.goto(`${BASE_URL}/master/orders/${orderId}`);
  await master.waitForLoadState('networkidle');

  // Снимок для диагностики — поможет увидеть, что показывает страница мастера
  await master.screenshot({ path: path.join(SNAP_DIR, 'master-order.png') });
  console.log('[e2e] master URL after goto:', master.url());

  // Ждём появления формы отклика (не просто networkidle)
  await master.waitForSelector('h2:has-text("Оставить отклик")', { timeout: 15_000 });

  await master.fill('input[formcontrolname="proposed_price"]', '12000');
  await master.fill('input[formcontrolname="estimated_days"]', '5');
  await master.fill('textarea[formcontrolname="comment"]', 'Готов взяться, опыт 7 лет.');
  await master.click('button[type="submit"]:has-text("Отправить отклик")');

  await master.waitForSelector('h2:has-text("Ваш отклик отправлен")', { timeout: 10_000 });

  // Мастер пишет в чат
  await master.fill('.chat-input', 'Здравствуйте! Уточните, есть ли доступ к воде?');
  await master.click('.chat-send');
  await master.waitForSelector('.chat-bubble:has-text("Здравствуйте!")', { timeout: 8_000 });

  // ── Шаг 3: Клиент читает отклик и выбирает мастера ─────────────────────────
  await client.reload();
  await client.waitForLoadState('networkidle');

  // Аккордеон автоматически раскрывается при загрузке — просто ждём его
  await client.waitForSelector('.acc-body--open', { timeout: 10_000 });

  // Клиент отвечает в чат внутри аккордеона
  await client.fill('.acc-body--open .chat-input', 'Да, всё есть. Когда сможете начать?');
  await client.click('.acc-body--open .chat-send');
  await client.waitForSelector('.acc-body--open .chat-bubble:has-text("Да, всё есть")', { timeout: 8_000 });

  // Выбираем этого мастера
  await client.click('.acc-select-btn:has-text("Выбрать этого мастера")');
  await client.waitForSelector('.status-master_selected', { timeout: 10_000 });

  // ── Шаг 4: Клиент завершает заявку ──────────────────────────────────────────
  await client.click('button:has-text("Отметить как завершённую")');
  await client.waitForSelector('.status-completed', { timeout: 10_000 });

  // ── Шаг 5: Клиент ставит оценку ─────────────────────────────────────────────
  const stars = client.locator('.star-btn');
  await stars.nth(4).click(); // 5 звёзд
  await client.waitForSelector('button:has-text("Отправить оценку")', { timeout: 5_000 });
  await client.click('button:has-text("Отправить оценку")');
  await client.waitForSelector('.rating-done', { timeout: 10_000 });

  await expect(client.locator('.rating-done')).toBeVisible();

  await clientCtx.close();
  await masterCtx.close();
});
