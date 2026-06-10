import { test, expect, Page } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'http://127.0.0.1:4200';
const AUTH_DIR = path.join('tests', '.auth');

// Используем уже сохранённые сессии из global-setup

test.describe('1. Клиент — создание заявки', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'client.json') });

  test('Открыть форму новой заявки', async ({ page }) => {
    await page.goto(`${BASE_URL}/client/orders`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/01-client-orders-list.png', fullPage: true });

    // Кнопка создать заявку
    const newOrderBtn = page.locator('a[href*="orders/new"], button:has-text("Новая заявка"), a:has-text("Новая заявка"), a:has-text("Создать заявку"), a:has-text("+ ")').first();
    console.log('Кнопка новой заявки найдена:', await newOrderBtn.count());
    await page.screenshot({ path: 'test-results/02-client-orders-new-button.png', fullPage: true });
  });

  test('Создать заявку через форму', async ({ page }) => {
    await page.goto(`${BASE_URL}/client/orders/new`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/03-order-create-form.png', fullPage: true });

    // Работа с чипами категорий
    const chips = page.locator('.wt-chip');
    const chipCount = await chips.count();
    console.log(`Количество чипов (типов работ): ${chipCount}`);

    // Список видов работ
    const names: string[] = [];
    for (let i = 0; i < chipCount; i++) {
      names.push(await chips.nth(i).textContent() ?? '');
    }
    console.log('Виды работ:', names.join(', '));

    // Кликаем на 3й чип
    if (chipCount > 2) {
      await chips.nth(2).click();
      await page.waitForTimeout(300);
    }

    // Площадь
    await page.fill('#area-sqm', '45');
    // Адрес
    await page.fill('#address', 'Грозный, Октябрьский район, ул. Мира 15');
    // Описание
    await page.fill('#description', 'Требуется качественная работа, есть все материалы');

    await page.screenshot({ path: 'test-results/04-form-filled.png', fullPage: true });

    // Отправляем форму
    await page.click('button[type="submit"]');

    // Ждём навигации на страницу детали заявки (не /new)
    await page.waitForFunction(() => !window.location.href.includes('/orders/new'), { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    const finalUrl = page.url();
    console.log('После создания URL:', finalUrl);
    await page.screenshot({ path: 'test-results/05-order-created.png', fullPage: true });

    expect(finalUrl).toMatch(/\/client\/orders\/[a-z0-9-]+$/);
  });
});

test.describe('2. Мастер — просмотр и отклик', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'master.json') });

  test('Открыть список заявок как мастер', async ({ page }) => {
    await page.goto(`${BASE_URL}/master/orders`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/06-master-orders-list.png', fullPage: true });

    const cards = page.locator('.order-card, [class*="order"], .card').first();
    console.log('Карточек заявок:', await page.locator('.order-card, [class*="order-item"]').count());
  });

  test('Открыть первую заявку и отправить отклик', async ({ page }) => {
    await page.goto(`${BASE_URL}/master/orders`);
    await page.waitForLoadState('networkidle');

    // Кликаем на первую доступную заявку
    const orderLinks = page.locator('a[href*="/master/orders/"]');
    const count = await orderLinks.count();
    console.log(`Найдено заявок для мастера: ${count}`);

    if (count > 0) {
      const href = await orderLinks.first().getAttribute('href');
      console.log('Открываем заявку:', href);
      await orderLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/07-master-order-detail.png', fullPage: true });

      // Форма отклика
      const priceInput = page.locator('input[formcontrolname="proposed_price"]');
      if (await priceInput.isVisible()) {
        await priceInput.fill('12000');

        const daysInput = page.locator('input[formcontrolname="estimated_days"]');
        if (await daysInput.isVisible()) await daysInput.fill('3');

        const commentInput = page.locator('textarea[formcontrolname="comment"]');
        if (await commentInput.isVisible()) {
          await commentInput.fill('Готов выполнить работу в срок. Опыт более 5 лет.');
        }

        await page.screenshot({ path: 'test-results/08-master-response-form.png', fullPage: true });

        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/09-master-response-sent.png', fullPage: true });
      } else {
        console.log('Форма отклика не найдена — возможно, уже откликнулись');
        await page.screenshot({ path: 'test-results/08-no-response-form.png', fullPage: true });
      }
    }
  });
});

test.describe('3. Клиент — чат с мастером', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'client.json') });

  test('Открыть заявку и написать в чат', async ({ page }) => {
    await page.goto(`${BASE_URL}/client/orders`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/10-client-orders-list.png', fullPage: true });

    // Открываем первую заявку с откликами (статус new или master_selected)
    const firstOrderLink = page.locator('a[href*="/client/orders/"]').first();
    if (await firstOrderLink.count() > 0) {
      await firstOrderLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Ждём загрузки откликов
      await page.screenshot({ path: 'test-results/11-client-order-with-responses.png', fullPage: true });

      // Ищем чат
      const chatScroll = page.locator('[id*="chat-"]').first();
      const chatInput = page.locator('input[placeholder*="сообщ"], input[placeholder*="Напишите"]').first();

      console.log('Chat area visible:', await chatScroll.isVisible().catch(() => false));
      console.log('Chat input visible:', await chatInput.isVisible().catch(() => false));

      if (await chatInput.isVisible()) {
        await chatInput.fill('Здравствуйте! Когда сможете приступить к работе?');
        await page.screenshot({ path: 'test-results/12-chat-message-typed.png', fullPage: true });

        // Отправляем — Enter или кнопка
        const sendBtn = page.locator('button:has-text("→"), button[aria-label*="Отправить"]').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        } else {
          await chatInput.press('Enter');
        }

        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'test-results/13-chat-message-sent.png', fullPage: true });

        // Второе сообщение
        await chatInput.fill('Также уточните, нужны ли дополнительные материалы?');
        await chatInput.press('Enter');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'test-results/14-chat-second-message.png', fullPage: true });
      } else {
        console.log('Чат не найден или нет откликов');
      }
    }
  });
});

test.describe('4. Мастер — ответ в чате', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'master.json') });

  test('Открыть отклик и ответить в чат', async ({ page }) => {
    await page.goto(`${BASE_URL}/master/responses`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/15-master-responses.png', fullPage: true });

    // Переходим к заявке
    const orderLink = page.locator('a[href*="/master/orders/"]').first();
    if (await orderLink.count() > 0) {
      await orderLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/16-master-order-chat.png', fullPage: true });

      const chatInput = page.locator('input[placeholder*="сообщ"], input[placeholder*="Напишите"]').first();
      if (await chatInput.isVisible()) {
        await chatInput.fill('Добрый день! Смогу приступить завтра в 9 утра.');

        const sendBtn = page.locator('button:has-text("→"), button[aria-label*="Отправить"]').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        } else {
          await chatInput.press('Enter');
        }

        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'test-results/17-master-chat-replied.png', fullPage: true });

        await chatInput.fill('Материалы свои, доплата не требуется.');
        await chatInput.press('Enter');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'test-results/18-master-chat-second.png', fullPage: true });
      } else {
        console.log('Чат не виден у мастера');
        await page.screenshot({ path: 'test-results/16-no-chat-for-master.png', fullPage: true });
      }
    }
  });
});
