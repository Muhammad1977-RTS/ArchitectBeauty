import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {}

const _channel = AndroidNotificationChannel(
  'mastero_channel',
  'Мастеро',
  description: 'Уведомления приложения Мастеро',
  importance: Importance.high,
);

class FcmService {
  final ApiClient _api;
  final _localNotifications = FlutterLocalNotificationsPlugin();

  FcmService(this._api);

  Future<void> init() async {
    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    await _localNotifications.initialize(
      const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      ),
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);

    FirebaseMessaging.onMessage.listen((message) {
      final n = message.notification;
      if (n != null) {
        _localNotifications.show(
          n.hashCode,
          n.title,
          n.body,
          NotificationDetails(
            android: AndroidNotificationDetails(
              _channel.id,
              _channel.name,
              channelDescription: _channel.description,
              importance: Importance.high,
              priority: Priority.high,
            ),
          ),
        );
      }
    });

    FirebaseMessaging.instance.onTokenRefresh.listen(_sendToken);
  }

  Future<void> registerToken() async {
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token != null) await _sendToken(token);
    } catch (_) {}
  }

  Future<void> _sendToken(String token) async {
    try {
      await _api.patch('/profiles/me/fcm-token', data: {'fcm_token': token});
    } catch (_) {}
  }
}

final fcmServiceProvider = Provider<FcmService>((ref) {
  return FcmService(ref.watch(apiClientProvider));
});
