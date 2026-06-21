import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/app_router.dart';
import 'core/services/fcm_service.dart';
import 'shared/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  runApp(const ProviderScope(child: MasteroApp()));
}

class MasteroApp extends ConsumerStatefulWidget {
  const MasteroApp({super.key});

  @override
  ConsumerState<MasteroApp> createState() => _MasteroAppState();
}

class _MasteroAppState extends ConsumerState<MasteroApp> {
  @override
  void initState() {
    super.initState();
    ref.read(fcmServiceProvider).init();
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'Мастеро',
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
