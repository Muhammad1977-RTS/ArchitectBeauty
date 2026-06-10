import { test, expect } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'http://127.0.0.1:4200';
const AUTH_DIR = path.join('tests', '.auth');

test.describe('Проверка исправлений', () => {

  test('Мастер — фильтр по категории на странице заявок', async ({ page }) => {
    await page.addInitScript(storage => {
      for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v as string);
    }, await (async () => {
      const fs = await import('fs');
      const state = JSON.parse(fs.readFileSync(path.join(AUTH_DIR, 'master.json'), 'utf8'));
      const items: Record<string, string> = {};
      for (const origin of state.origins || []) {
        if (origin.origin.includes('4200')) {
          for (const item of origin.localStorage || []) items[item.name] = item.value;
        }
      }
      return items;
    })());

    await page.goto(`${BASE_URL}/master/orders`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/fix-01-master-orders-with-filter.png', fullPage: true });

    const filterChips = page.locator('.filter-chip');
    const count = await filterChips.count();
    console.log('Фильтр-чипов:', count);

    if (count > 1) {
      // Кликаем на второй чип (первая категория)
      await filterChips.nth(1).click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'test-results/fix-02-master-orders-filtered.png', fullPage: true });
    }
  });

  test('Клиент — чат с корректными пузырями', async ({ page }) => {
    await page.addInitScript(storage => {
      for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v as string);
    }, await (async () => {
      const fs = await import('fs');
      const state = JSON.parse(fs.readFileSync(path.join(AUTH_DIR, 'client.json'), 'utf8'));
      const items: Record<string, string> = {};
      for (const origin of state.origins || []) {
        if (origin.origin.includes('4200')) {
          for (const item of origin.localStorage || []) items[item.name] = item.value;
        }
      }
      return items;
    })());

    // Заходим на старую заявку с сообщениями
    await page.goto(`${BASE_URL}/client/orders/6e7b2269-26c1-4fbd-883b-b3e3d4706d2c`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/fix-03-client-chat-bubbles.png', fullPage: true });

    const bubbles = page.locator('.chat-bubble');
    const bubbleCount = await bubbles.count();
    console.log('Пузырей в чате:', bubbleCount);

    if (bubbleCount > 0) {
      const firstText = await bubbles.first().textContent();
      console.log('Текст первого пузыря:', firstText);
    }
  });

  test('Мастер — чат с корректными пузырями', async ({ page }) => {
    await page.addInitScript(storage => {
      for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v as string);
    }, await (async () => {
      const fs = await import('fs');
      const state = JSON.parse(fs.readFileSync(path.join(AUTH_DIR, 'master.json'), 'utf8'));
      const items: Record<string, string> = {};
      for (const origin of state.origins || []) {
        if (origin.origin.includes('4200')) {
          for (const item of origin.localStorage || []) items[item.name] = item.value;
        }
      }
      return items;
    })());

    // Заходим на старую заявку с сообщениями
    await page.goto(`${BASE_URL}/master/orders/6e7b2269-26c1-4fbd-883b-b3e3d4706d2c`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/fix-04-master-chat-bubbles.png', fullPage: true });

    const bubbles = page.locator('.chat-bubble');
    const bubbleCount = await bubbles.count();
    console.log('Пузырей в чате у мастера:', bubbleCount);

    for (let i = 0; i < bubbleCount; i++) {
      const txt = await bubbles.nth(i).textContent();
      const color = await bubbles.nth(i).evaluate(el => getComputedStyle(el).color);
      const bg = await bubbles.nth(i).evaluate(el => getComputedStyle(el).backgroundColor);
      console.log(`Пузырь ${i+1}: "${txt?.trim()}" | цвет: ${color} | фон: ${bg}`);
    }
  });

  test('Клиент-мастер — полный чат сценарий', async ({ browser }) => {
    // Клиент открывает свою заявку с откликами
    const clientCtx = await browser.newContext({ storageState: path.join(AUTH_DIR, 'client.json') });
    const clientPage = await clientCtx.newPage();

    await clientPage.goto(`${BASE_URL}/client/orders/6e7b2269-26c1-4fbd-883b-b3e3d4706d2c`);
    await clientPage.waitForLoadState('networkidle');
    await clientPage.waitForTimeout(2000);
    await clientPage.screenshot({ path: 'test-results/fix-05-client-full-order.png', fullPage: true });

    // Ищем поле ввода чата
    const chatInput = clientPage.locator('input.chat-input').first();
    if (await chatInput.isVisible()) {
      await chatInput.fill('Проверка чата: всё работает?');
      await clientPage.keyboard.press('Enter');
      await clientPage.waitForTimeout(1500);
      await clientPage.screenshot({ path: 'test-results/fix-06-client-sent-message.png', fullPage: true });
    } else {
      console.log('Chat input не найден у клиента');
    }

    await clientCtx.close();

    // Мастер открывает ту же заявку
    const masterCtx = await browser.newContext({ storageState: path.join(AUTH_DIR, 'master.json') });
    const masterPage = await masterCtx.newPage();

    await masterPage.goto(`${BASE_URL}/master/orders/6e7b2269-26c1-4fbd-883b-b3e3d4706d2c`);
    await masterPage.waitForLoadState('networkidle');
    await masterPage.waitForTimeout(2000);
    await masterPage.screenshot({ path: 'test-results/fix-07-master-sees-message.png', fullPage: true });

    const masterInput = masterPage.locator('input.chat-input').first();
    if (await masterInput.isVisible()) {
      await masterInput.fill('Да, всё отлично! Звоните для уточнений.');
      await masterPage.keyboard.press('Enter');
      await masterPage.waitForTimeout(1500);
      await masterPage.screenshot({ path: 'test-results/fix-08-master-replied.png', fullPage: true });
    }

    await masterCtx.close();
  });
});
