/**
 * Полный E2E тест Flutter API — Mastero
 * Клиент → 20 заказов с фото → мастера откликаются → чат → выбор → завершение → оценка
 */

const BASE = 'http://localhost:3001/api';

let passed = 0;
let failed = 0;

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function ok(label, condition, detail) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    const extra = detail ? ` — ${detail}` : '';
    console.log(`  ❌ ${label}${extra}`);
    failed++;
  }
}

function section(title) {
  const line = '═'.repeat(62);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(line);
}

async function registerOrLogin(email, password, name, role) {
  let r = await api('POST', '/auth/register', { email, password, name, role });
  if (r.data && r.data.token) return { token: r.data.token, id: r.data.user.id };
  // уже существует
  r = await api('POST', '/auth/login', { email, password });
  if (r.data && r.data.token) return { token: r.data.token, id: r.data.user.id };
  throw new Error(`auth fail for ${email}: ${JSON.stringify(r.data)}`);
}

const ORDER_DATA = [
  { desc: 'Укладка плитки в ванной', address: 'ул. Ленина, 12, кв. 45', area: 8, photos: 2 },
  { desc: 'Покраска стен в гостиной', address: 'пр. Мира, 34, кв. 12', area: 25, photos: 3 },
  { desc: 'Поклейка обоев в спальне', address: 'ул. Пушкина, 7, кв. 89', area: 18, photos: 1 },
  { desc: 'Установка натяжных потолков', address: 'ул. Садовая, 55, кв. 3', area: 40, photos: 4 },
  { desc: 'Электромонтаж под ключ', address: 'Комсомольская, 8, кв. 21', area: 65, photos: 2 },
  { desc: 'Сантехника в санузле', address: 'ул. Чехова, 19, кв. 7', area: 6, photos: 3 },
  { desc: 'Монтаж гипсокартона, перегородки', address: 'ул. Горького, 44, кв. 15', area: 30, photos: 2 },
  { desc: 'Демонтаж старой плитки', address: 'пр. Победы, 100, кв. 56', area: 12, photos: 1 },
  { desc: 'Шпаклёвка и штукатурка стен', address: 'ул. Воровского, 3, кв. 33', area: 50, photos: 3 },
  { desc: 'Укладка ламината в двух комнатах', address: 'бул. Дружбы, 22, кв. 4', area: 35, photos: 2 },
  { desc: 'Установка межкомнатных дверей', address: 'ул. Ленина, 77, кв. 11', area: 0.5, photos: 2 },
  { desc: 'Монтаж кухонной мебели', address: 'ул. Советская, 2, кв. 67', area: 10, photos: 4 },
  { desc: 'Ремонт балкона под ключ', address: 'пр. Революции, 14, кв. 22', area: 5, photos: 3 },
  { desc: 'Поклейка потолочного плинтуса', address: 'ул. Мичурина, 9, кв. 88', area: 45, photos: 1 },
  { desc: 'Покраска фасада здания', address: 'ул. Набережная, 1', area: 120, photos: 5 },
  { desc: 'Монтаж системы вентиляции', address: 'пр. Красный, 50, кв. 31', area: 80, photos: 2 },
  { desc: 'Установка окон ПВХ', address: 'ул. Лермонтова, 25, кв. 9', area: 2, photos: 2 },
  { desc: 'Облицовка стен кирпичом (декор)', address: 'ул. Гоголя, 38, кв. 17', area: 15, photos: 3 },
  { desc: 'Заливка стяжки пола', address: 'Центральная, 7, кв. 1', area: 55, photos: 2 },
  { desc: 'Полный ремонт квартиры под ключ', address: 'пр. Ленинградский, 90, кв. 5', area: 70, photos: 6 },
];

const MASTER_COMMENTS = [
  'Выполню быстро и качественно, все инструменты имею',
  'Опыт 7 лет, работаю с гарантией 2 года',
  'Готов приступить завтра. Материалы свои',
];

const CHAT_CLIENT = [
  'Здравствуйте! Когда сможете приступить к работе?',
  'Нужно ли закупать какие-то материалы заранее?',
  'Какой опыт у вас в данном виде работ?',
];

const CHAT_MASTER = [
  'Добрый день! Могу начать уже завтра утром.',
  'Все необходимые материалы у меня есть.',
  'Опыт более 5 лет, всегда работаю с гарантией.',
];

const RATINGS = [
  { rating: 5, review: 'Отличная работа! Всё сделал быстро и аккуратно.' },
  { rating: 4, review: 'Хорошее качество, немного задержался по срокам.' },
  { rating: 5, review: 'Профессионал своего дела, рекомендую!' },
  { rating: 3, review: 'Работа выполнена, но были замечания по качеству.' },
  { rating: 5, review: 'Превзошёл все ожидания, работаем дальше.' },
];

async function main() {
  console.log('\n🚀 MASTERO — Полный E2E тест Flutter API');
  console.log('   Цикл: регистрация → заказы → отклики → чат → выбор → завершение → оценка\n');

  // ── 1. Пользователи ─────────────────────────────────────
  section('1. Регистрация / вход пользователей');

  const client = await registerOrLogin(
    'flutter_client@test.com', 'flutter123', 'Алибек Джабраилов', 'client'
  );
  ok('Клиент зарегистрирован/вошёл', !!client.token, `ID: ${client.id?.slice(0,8)}`);

  const masterData = [
    { email: 'master1_flutter@test.com', name: 'Рустам Мусаев' },
    { email: 'master2_flutter@test.com', name: 'Ахмат Кадыров' },
    { email: 'master3_flutter@test.com', name: 'Магомед Темиров' },
  ];
  const masters = [];
  for (const { email, name } of masterData) {
    const m = await registerOrLogin(email, 'flutter123', name, 'master');
    ok(`Мастер "${name}" вошёл`, !!m.token, `ID: ${m.id?.slice(0,8)}`);
    masters.push(m);
  }

  // ── 2. Виды работ ────────────────────────────────────────
  section('2. Получение видов работ');

  const wtR = await api('GET', '/work-types', null, client.token);
  ok('Список видов работ получен', wtR.status === 200);
  const workTypes = Array.isArray(wtR.data) ? wtR.data : [];
  ok('Виды работ существуют', workTypes.length > 0, `найдено: ${workTypes.length}`);
  if (workTypes.length) {
    console.log(`  ℹ️  Виды: ${workTypes.map(w => w.name).join(', ')}`);
  }

  if (workTypes.length === 0) {
    console.log('\n❌ Нет видов работ в БД. Добавьте их через /api/work-types (admin)');
    process.exit(1);
  }

  // ── 3. 20 заказов с фотографиями ─────────────────────────
  section('3. Клиент — создание 20 заказов с фотографиями');

  const orders = [];

  for (let i = 0; i < 20; i++) {
    const od = ORDER_DATA[i];
    const wt = workTypes[i % workTypes.length];

    // Имитируем URLs фото (в реальном приложении загружаются через /uploads/photo)
    const photoUrls = Array.from(
      { length: od.photos },
      (_, j) => `/uploads/test-order-${i + 1}-photo-${j + 1}.jpg`
    );

    const r = await api('POST', '/orders', {
      workTypeId: wt.id,
      areaSqm: od.area,
      address: od.address,
      description: od.desc,
      photoUrls,
    }, client.token);

    const success = r.status === 200 || r.status === 201;
    const shortDesc = od.desc.slice(0, 38);
    ok(
      `Заказ ${String(i + 1).padStart(2, '0')}: ${shortDesc}...`,
      success,
      success
        ? `ID:${r.data.id?.slice(0,8)} фото:${photoUrls.length}`
        : JSON.stringify(r.data).slice(0, 80)
    );

    if (success) orders.push(r.data);
  }

  console.log(`\n  ℹ️  Создано: ${orders.length}/20 заказов`);

  if (orders.length === 0) {
    console.log('❌ Нет заказов — прерываем');
    process.exit(1);
  }

  // ── 4. Мастера просматривают список и откликаются ────────
  section('4. Мастера — просмотр заказов и отклики');

  const allOrdersR = await api('GET', '/orders', null, masters[0].token);
  ok('Общий список заказов доступен мастеру', allOrdersR.status === 200);
  console.log(`  ℹ️  Видно заказов мастеру: ${allOrdersR.data?.length ?? 0}`);

  // orderId → [{masterIdx, responseId}]
  const responseMap = {};

  const masterPlan = [
    { mi: 0, count: 7 },   // Мастер 1 → первые 7
    { mi: 1, count: 20 },  // Мастер 2 → все 20
    { mi: 2, count: 10 },  // Мастер 3 → первые 10
  ];

  for (const { mi, count } of masterPlan) {
    let done = 0;
    for (let oi = 0; oi < Math.min(count, orders.length); oi++) {
      const order = orders[oi];
      const price = 5000 + (mi * 2000) + (oi * 200);
      const r = await api('POST', '/responses', {
        orderId: order.id,
        proposedPrice: price,
        comment: MASTER_COMMENTS[mi],
        estimatedDays: mi + 2,
      }, masters[mi].token);

      const success = r.status === 200 || r.status === 201;
      if (success) {
        done++;
        if (!responseMap[order.id]) responseMap[order.id] = [];
        responseMap[order.id].push({ mi, responseId: r.data.id });
      }
    }
    ok(
      `Мастер ${mi + 1} ("${masterData[mi].name}") → откликнулся на ${done} заказов`,
      done > 0,
      `ожидалось до ${count}`
    );
  }

  // ── 5. Клиент видит отклики ──────────────────────────────
  section('5. Клиент — просмотр откликов');

  for (let i = 0; i < Math.min(4, orders.length); i++) {
    const r = await api('GET', `/responses/by-order/${orders[i].id}`, null, client.token);
    const count = r.data?.length ?? 0;
    ok(
      `Заказ ${i + 1}: откликов=${count}`,
      r.status === 200 && count > 0
    );
  }

  // ── 6. Чат клиент ↔ мастер ───────────────────────────────
  section('6. Чат — клиент пишет мастерам, мастера отвечают');

  const chatCount = Math.min(5, orders.length);

  for (let i = 0; i < chatCount; i++) {
    const order = orders[i];
    const mi = i % masters.length;
    const masterId = masters[mi].id;

    // Клиент → 3 сообщения
    let clientSent = 0;
    for (const msg of CHAT_CLIENT) {
      const r = await api(
        'POST',
        `/messages/order/${order.id}/master/${masterId}`,
        { content: msg },
        client.token
      );
      if (r.status === 200 || r.status === 201) clientSent++;
    }
    ok(
      `Заказ ${i + 1}: Клиент → Мастер${mi + 1} — ${clientSent}/3 сообщений`,
      clientSent === 3
    );

    // Мастер → 3 сообщения
    let masterSent = 0;
    for (const msg of CHAT_MASTER) {
      const r = await api(
        'POST',
        `/messages/order/${order.id}/master/${masterId}`,
        { content: msg },
        masters[mi].token
      );
      if (r.status === 200 || r.status === 201) masterSent++;
    }
    ok(
      `Заказ ${i + 1}: Мастер${mi + 1} → Клиент — ${masterSent}/3 сообщений`,
      masterSent === 3
    );

    // Проверяем историю чата
    const histR = await api(
      'GET',
      `/messages/order/${order.id}/master/${masterId}`,
      null,
      client.token
    );
    const total = histR.data?.length ?? 0;
    ok(
      `Заказ ${i + 1}: история чата = ${total} сообщений`,
      total >= 6
    );
  }

  // ── 7. Клиент выбирает мастеров ─────────────────────────
  section('7. Клиент — выбор разных мастеров для разных заказов');

  const selectedOrders = [];

  for (let i = 0; i < Math.min(15, orders.length); i++) {
    const order = orders[i];
    const responses = responseMap[order.id] || [];
    if (responses.length === 0) continue;

    // Чередуем мастеров
    const pick = responses[i % responses.length];
    const masterId = masters[pick.mi].id;
    const masterName = masterData[pick.mi].name;

    const r = await api(
      'PATCH',
      `/orders/${order.id}/select-master`,
      { master_id: masterId },
      client.token
    );

    const success = r.status === 200 || r.status === 201;
    ok(
      `Заказ ${i + 1}: выбран "${masterName}"`,
      success,
      success ? `статус: ${r.data.status}` : JSON.stringify(r.data).slice(0, 80)
    );
    if (success) selectedOrders.push({ order, masterId, mi: pick.mi });
  }

  console.log(`\n  ℹ️  Мастер выбран для ${selectedOrders.length} заказов`);

  // ── 8. Завершение заказов ────────────────────────────────
  section('8. Клиент — завершение заказов');

  const completedOrders = [];

  for (let i = 0; i < Math.min(12, selectedOrders.length); i++) {
    const { order } = selectedOrders[i];
    const r = await api('PATCH', `/orders/${order.id}/complete`, null, client.token);
    const success = r.status === 200 || r.status === 201;
    ok(
      `Заказ ${i + 1} завершён`,
      success,
      success ? `статус: ${r.data.status}` : JSON.stringify(r.data).slice(0, 80)
    );
    if (success) completedOrders.push(selectedOrders[i]);
  }

  // ── 9. Оценка мастеров ────────────────────────────────────
  section('9. Клиент — оценка мастеров только после завершения');

  // Пробуем оценить незавершённый заказ (должна быть ошибка)
  if (selectedOrders.length > completedOrders.length) {
    const notCompletedOrder = selectedOrders.find(
      s => !completedOrders.some(c => c.order.id === s.order.id)
    );
    if (notCompletedOrder) {
      const r = await api(
        'PATCH',
        `/orders/${notCompletedOrder.order.id}/rate`,
        { rating: 5, review_text: 'Попытка оценить незавершённый' },
        client.token
      );
      ok(
        'Нельзя оценить незавершённый заказ (ожидаем ошибку)',
        r.status === 400,
        `статус: ${r.status}`
      );
    }
  }

  // Оцениваем завершённые
  for (let i = 0; i < completedOrders.length; i++) {
    const { order, mi } = completedOrders[i];
    const rd = RATINGS[i % RATINGS.length];

    const r = await api(
      'PATCH',
      `/orders/${order.id}/rate`,
      { rating: rd.rating, review_text: rd.review },
      client.token
    );

    const success = r.status === 200 || r.status === 201;
    ok(
      `Заказ ${i + 1} оценён ${rd.rating}⭐ (мастер: ${masterData[mi].name})`,
      success,
      success ? `review: "${rd.review.slice(0, 30)}..."` : JSON.stringify(r.data).slice(0, 80)
    );
  }

  // Двойная оценка должна обновляться без ошибки (или вернуть 400)
  if (completedOrders.length > 0) {
    const { order } = completedOrders[0];
    const r = await api(
      'PATCH',
      `/orders/${order.id}/rate`,
      { rating: 4, review_text: 'Обновлённый отзыв' },
      client.token
    );
    ok(
      'Повторная оценка обрабатывается',
      r.status === 200 || r.status === 201 || r.status === 400,
      `статус: ${r.status}`
    );
  }

  // ── 10. Итоговая верификация ─────────────────────────────
  section('10. Верификация — итоговое состояние системы');

  const myOrdersR = await api('GET', '/orders/my', null, client.token);
  ok('GET /orders/my работает', myOrdersR.status === 200);
  const myOrders = myOrdersR.data || [];
  // >= потому что могут быть заказы от предыдущих прогонов
  ok(`Заказов у клиента: ${myOrders.length} (создано в этом прогоне: ${orders.length})`, myOrders.length >= orders.length);

  const statusCounts = {};
  for (const o of myOrders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }
  console.log('\n  ℹ️  Статусы заказов:');
  for (const [s, c] of Object.entries(statusCounts)) {
    const icon = s === 'completed' ? '🟢' : s === 'master_selected' ? '🔵' : '⚪';
    console.log(`     ${icon} ${s}: ${c}`);
  }

  const ratedOrders = myOrders.filter(o => o.rating != null);
  // Проверяем что те заказы, которые мы завершили и оценили в этом прогоне — действительно оценены
  const thisRunRated = completedOrders.filter(co =>
    myOrders.find(o => o.id === co.order.id && o.rating != null)
  );
  ok(
    `Заказы этого прогона с оценкой: ${thisRunRated.length}/${completedOrders.length}`,
    thisRunRated.length === completedOrders.length
  );

  // Мастера смотрят свои отклики
  for (let mi = 0; mi < masters.length; mi++) {
    const r = await api('GET', '/responses/my', null, masters[mi].token);
    ok(
      `Мастер ${mi + 1} видит свои отклики (${r.data?.length ?? 0})`,
      r.status === 200 && Array.isArray(r.data) && (r.data?.length ?? 0) > 0
    );
  }

  // Детальный просмотр одного заказа клиентом
  if (completedOrders.length > 0) {
    const { order } = completedOrders[0];
    const r = await api('GET', `/orders/${order.id}`, null, client.token);
    ok('Детали завершённого заказа доступны', r.status === 200);
    if (r.status === 200) {
      ok(
        `Заказ ${order.id.slice(0,8)}: статус=${r.data.status}, рейтинг=${r.data.rating}`,
        r.data.status === 'completed' && r.data.rating != null
      );
    }
  }

  // ── Итог ─────────────────────────────────────────────────
  const line = '═'.repeat(62);
  console.log(`\n${line}`);
  console.log('  ИТОГИ E2E ТЕСТА');
  console.log(line);
  console.log(`  ✅ Пройдено:  ${passed}`);
  console.log(`  ❌ Провалено: ${failed}`);
  console.log(`  📊 Всего:     ${passed + failed} проверок`);
  console.log(line);

  if (failed > 0) {
    console.log('\n  ⚠️  Есть ошибки — проверьте логи выше\n');
    process.exit(1);
  } else {
    console.log('\n  🎉 Все проверки пройдены успешно!\n');
  }
}

main().catch(e => {
  console.error('\n💥 Критическая ошибка:', e.message);
  console.error(e.stack);
  process.exit(1);
});
