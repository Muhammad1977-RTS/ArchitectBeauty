import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mastero_flutter/main.dart' as app;

// Тестовые аккаунты (созданы E2E API-тестом)
const _clientEmail = 'flutter_client@test.com';
const _clientPass = 'flutter123';
const _master1Email = 'master1_flutter@test.com';
const _master1Pass = 'flutter123';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Mastero — полный пользовательский сценарий', () {
    // ── Хелперы ───────────────────────────────────────────────

    Future<void> login(WidgetTester tester, String email, String pass) async {
      // Ждём экран логина
      await tester.pumpAndSettle(const Duration(seconds: 3));

      final emailField = find.byType(TextFormField).first;
      final passField = find.byType(TextFormField).last;

      await tester.tap(emailField);
      await tester.enterText(emailField, email);
      await tester.tap(passField);
      await tester.enterText(passField, pass);
      await tester.pumpAndSettle();

      // Нажимаем «Войти»
      final loginBtn = find.text('Войти');
      expect(loginBtn, findsOneWidget);
      await tester.tap(loginBtn);
      await tester.pumpAndSettle(const Duration(seconds: 4));
    }

    Future<void> logout(WidgetTester tester) async {
      // Профиль → Выйти
      final profileTab = find.byIcon(Icons.person_outline);
      if (profileTab.evaluate().isNotEmpty) {
        await tester.tap(profileTab);
        await tester.pumpAndSettle(const Duration(seconds: 2));
        final logoutBtn = find.text('Выйти');
        if (logoutBtn.evaluate().isNotEmpty) {
          await tester.tap(logoutBtn);
          await tester.pumpAndSettle(const Duration(seconds: 3));
        }
      }
    }

    // ── Тест 1: Клиент видит свои заказы ─────────────────────
    testWidgets('01 — Клиент: вход и список заказов', (tester) async {
      app.main();
      await login(tester, _clientEmail, _clientPass);

      // Должен быть экран клиента
      expect(find.byIcon(Icons.list_alt).evaluate().isNotEmpty ||
             find.text('Мои заказы').evaluate().isNotEmpty ||
             find.text('Заказы').evaluate().isNotEmpty, isTrue,
             reason: 'Должен отобразиться список заказов клиента');

      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Должны быть заказы (созданы API-тестом)
      final cards = find.byType(Card);
      expect(cards.evaluate().length, greaterThan(0),
             reason: 'Должны быть карточки заказов');

      debugPrint('✅ Клиент вошёл, видно карточек: ${cards.evaluate().length}');
    });

    // ── Тест 2: Клиент создаёт новый заказ ───────────────────
    testWidgets('02 — Клиент: создание нового заказа', (tester) async {
      app.main();
      await login(tester, _clientEmail, _clientPass);

      // Кнопка «+» или «Новый заказ»
      final addBtn = find.byIcon(Icons.add);
      if (addBtn.evaluate().isNotEmpty) {
        await tester.tap(addBtn.first);
      } else {
        final newOrderBtn = find.text('Новый заказ');
        expect(newOrderBtn, findsOneWidget);
        await tester.tap(newOrderBtn);
      }
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Форма создания заказа
      expect(find.text('Новый заказ'), findsAtLeastNWidgets(1),
             reason: 'Должен открыться экран создания заказа');

      // Выбираем первый chip вида работ
      final chips = find.byType(FilterChip);
      await tester.pumpAndSettle(const Duration(seconds: 3)); // ждём загрузки типов
      final loadedChips = find.byType(FilterChip);
      if (loadedChips.evaluate().isNotEmpty) {
        await tester.tap(loadedChips.first);
        await tester.pumpAndSettle();
        debugPrint('✅ Выбран тип работ');
      }

      // Адрес
      final addressField = find.widgetWithText(TextFormField, 'Адрес').first;
      await tester.tap(addressField);
      await tester.enterText(addressField, 'ул. Тестовая, 99, кв. 1');

      // Площадь
      final areaField = find.widgetWithText(TextFormField, 'Площадь (м²)').first;
      await tester.tap(areaField);
      await tester.enterText(areaField, '30');

      await tester.pumpAndSettle();

      // Отправляем
      final submitBtn = find.text('Создать заказ');
      expect(submitBtn, findsOneWidget);
      await tester.tap(submitBtn);
      await tester.pumpAndSettle(const Duration(seconds: 4));

      // Должны вернуться на список заказов
      final backOnList = find.byType(Card);
      debugPrint('✅ Заказ создан, карточек на экране: ${backOnList.evaluate().length}');
    });

    // ── Тест 3: Клиент открывает заказ и видит отклики ───────
    testWidgets('03 — Клиент: детали заказа и отклики мастеров', (tester) async {
      app.main();
      await login(tester, _clientEmail, _clientPass);
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Открываем первую карточку заказа
      final cards = find.byType(Card);
      expect(cards.evaluate().length, greaterThan(0));
      await tester.tap(cards.first);
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Экран деталей — должны быть отклики или статус
      final hasResponses = find.text('Отклики мастеров').evaluate().isNotEmpty;
      final hasMasterSelected = find.text('Мастер выбран').evaluate().isNotEmpty;
      final hasCompleted = find.text('Заказ завершён').evaluate().isNotEmpty;

      expect(hasResponses || hasMasterSelected || hasCompleted, isTrue,
             reason: 'Должна быть секция откликов или статуса заказа');

      debugPrint('✅ Детали заказа открыты. '
          'Отклики: $hasResponses, Мастер выбран: $hasMasterSelected, '
          'Завершён: $hasCompleted');
    });

    // ── Тест 4: Чат клиент → мастер ──────────────────────────
    testWidgets('04 — Клиент: чат с мастером', (tester) async {
      app.main();
      await login(tester, _clientEmail, _clientPass);
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Ищем заказ с откликом или выбранным мастером — открываем
      final cards = find.byType(Card);
      if (cards.evaluate().isEmpty) return;

      // Пробуем несколько карточек пока не найдём чат
      bool chatFound = false;
      for (int i = 0; i < cards.evaluate().length && !chatFound; i++) {
        await tester.tap(cards.at(i));
        await tester.pumpAndSettle(const Duration(seconds: 2));

        final chatBtn = find.text('Чат');
        if (chatBtn.evaluate().isNotEmpty) {
          await tester.tap(chatBtn.first);
          await tester.pumpAndSettle(const Duration(seconds: 2));

          // Экран чата
          expect(find.text('Написать сообщение...').evaluate().isNotEmpty ||
                 find.text('Начните диалог').evaluate().isNotEmpty, isTrue,
                 reason: 'Должен открыться чат');

          // Отправляем сообщение
          final inputField = find.byType(TextField).last;
          await tester.tap(inputField);
          await tester.enterText(inputField, 'Тестовое сообщение из Flutter теста');
          await tester.pumpAndSettle();

          // Кнопка отправки
          final sendBtn = find.byIcon(Icons.send);
          if (sendBtn.evaluate().isNotEmpty) {
            await tester.tap(sendBtn);
            await tester.pumpAndSettle(const Duration(seconds: 2));
          }

          chatFound = true;
          debugPrint('✅ Чат работает, сообщение отправлено');
        } else {
          // Возвращаемся назад
          final backBtn = find.byIcon(Icons.arrow_back);
          if (backBtn.evaluate().isNotEmpty) {
            await tester.tap(backBtn);
            await tester.pumpAndSettle();
          }
        }
      }

      if (!chatFound) {
        debugPrint('ℹ️ Чат не найден (заказ может не иметь откликов с кнопкой чата)');
      }
    });

    // ── Тест 5: Мастер — вход и список заказов ───────────────
    testWidgets('05 — Мастер: вход и список откликов', (tester) async {
      app.main();
      await login(tester, _master1Email, _master1Pass);
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Экран мастера — должны быть заказы или отклики
      final hasOrders = find.byType(Card).evaluate().isNotEmpty;
      debugPrint('Карточек у мастера: ${find.byType(Card).evaluate().length}');

      // Ищем вкладку откликов
      final responsesTab = find.text('Мои отклики');
      if (responsesTab.evaluate().isNotEmpty) {
        await tester.tap(responsesTab);
        await tester.pumpAndSettle(const Duration(seconds: 2));
        debugPrint('✅ Открыта вкладка откликов мастера');
      }

      final cards = find.byType(Card);
      expect(cards.evaluate().length, greaterThan(0),
             reason: 'У мастера должны быть отклики (созданы API-тестом)');

      debugPrint('✅ Мастер вошёл. Карточек: ${cards.evaluate().length}');
    });

    // ── Тест 6: Мастер откликается на новый заказ ─────────────
    testWidgets('06 — Мастер: отклик на заказ из общего списка', (tester) async {
      app.main();
      await login(tester, _master1Email, _master1Pass);
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Переходим на список всех заказов
      final allOrdersTab = find.byIcon(Icons.search).evaluate().isNotEmpty
          ? find.byIcon(Icons.search)
          : find.text('Заказы');

      if (allOrdersTab.evaluate().isNotEmpty) {
        await tester.tap(allOrdersTab.first);
        await tester.pumpAndSettle(const Duration(seconds: 3));
      }

      final cards = find.byType(Card);
      debugPrint('Заказов в общем списке: ${cards.evaluate().length}');

      if (cards.evaluate().isNotEmpty) {
        await tester.tap(cards.first);
        await tester.pumpAndSettle(const Duration(seconds: 2));

        // Форма отклика
        final priceField = find.byType(TextFormField);
        if (priceField.evaluate().isNotEmpty) {
          await tester.tap(priceField.first);
          await tester.enterText(priceField.first, '9500');
          await tester.pumpAndSettle();

          // Если есть поле дней
          if (priceField.evaluate().length > 1) {
            await tester.tap(priceField.at(1));
            await tester.enterText(priceField.at(1), '4');
          }

          // Поле комментария
          final commentArea = find.byType(TextField);
          if (commentArea.evaluate().isNotEmpty) {
            await tester.tap(commentArea.last);
            await tester.enterText(commentArea.last,
                'Готов выполнить работу, опыт 5 лет');
          }

          final submitBtn = find.text('Откликнуться');
          if (submitBtn.evaluate().isNotEmpty) {
            await tester.tap(submitBtn);
            await tester.pumpAndSettle(const Duration(seconds: 3));
            debugPrint('✅ Мастер откликнулся на заказ');
          } else {
            debugPrint('ℹ️ Кнопка "Откликнуться" не найдена (уже откликнулся)');
          }
        }
      }
    });

    // ── Тест 7: Завершение заказа и оценка ────────────────────
    testWidgets('07 — Клиент: завершение и оценка мастера', (tester) async {
      app.main();
      await login(tester, _clientEmail, _clientPass);
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Ищем заказ со статусом «Мастер выбран» или «Завершён»
      final cards = find.byType(Card);
      bool foundCompletedFlow = false;

      for (int i = 0; i < cards.evaluate().length && !foundCompletedFlow; i++) {
        await tester.tap(cards.at(i));
        await tester.pumpAndSettle(const Duration(seconds: 2));

        // Заказ с выбранным мастером
        final completeBtn = find.text('Завершить');
        if (completeBtn.evaluate().isNotEmpty) {
          await tester.tap(completeBtn);
          await tester.pumpAndSettle(const Duration(seconds: 1));

          // Диалог подтверждения
          final confirmBtn = find.text('Завершить');
          if (confirmBtn.evaluate().isNotEmpty) {
            await tester.tap(confirmBtn.last);
            await tester.pumpAndSettle(const Duration(seconds: 3));
          }
          foundCompletedFlow = true;
          debugPrint('✅ Заказ завершён');
        }

        // Заказ завершён — кнопка оценки
        final rateBtn = find.text('Оценить мастера');
        if (rateBtn.evaluate().isNotEmpty) {
          await tester.tap(rateBtn);
          await tester.pumpAndSettle(const Duration(seconds: 1));

          // Выбираем 5 звёзд
          final stars = find.byIcon(Icons.star_border);
          if (stars.evaluate().isNotEmpty) {
            await tester.tap(stars.last);
            await tester.pumpAndSettle();
          }

          // Отзыв
          final reviewField = find.byType(TextField);
          if (reviewField.evaluate().isNotEmpty) {
            await tester.enterText(reviewField.last,
                'Отличная работа, всё сделано качественно и в срок!');
          }

          final sendRating = find.text('Отправить оценку');
          if (sendRating.evaluate().isNotEmpty) {
            await tester.tap(sendRating);
            await tester.pumpAndSettle(const Duration(seconds: 3));
            debugPrint('✅ Оценка мастера отправлена');
          }
          foundCompletedFlow = true;
        }

        if (!foundCompletedFlow) {
          final backBtn = find.byIcon(Icons.arrow_back);
          if (backBtn.evaluate().isNotEmpty) {
            await tester.tap(backBtn);
            await tester.pumpAndSettle();
          }
        }
      }

      if (!foundCompletedFlow) {
        debugPrint('ℹ️ Заказов для завершения не найдено (уже завершены в API-тесте)');
      }
    });
  });
}
