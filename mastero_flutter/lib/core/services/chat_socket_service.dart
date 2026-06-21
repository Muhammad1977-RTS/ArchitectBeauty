import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../api/api_client.dart';
import '../config/app_config.dart';

const _wsUrl = '${AppConfig.wsBaseUrl}/chat';
const _tokenKey = 'auth_token';

class ChatSocketService {
  io.Socket? _socket;
  final FlutterSecureStorage _storage;

  ChatSocketService(this._storage);

  bool get isConnected => _socket?.connected ?? false;

  Future<void> connect() async {
    if (_socket != null && _socket!.connected) return;

    final token = await _storage.read(key: _tokenKey);
    if (token == null) return;

    _socket?.dispose();
    _socket = io.io(
      _wsUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .disableAutoConnect()
          .build(),
    );

    _socket!.connect();
  }

  void joinRoom({
    required String orderId,
    required String otherId,
    bool isTransport = false,
  }) {
    _socket?.emit('join', {
      'orderId': orderId,
      'otherId': otherId,
      'isTransport': isTransport,
    });
  }

  void sendMessage({
    required String orderId,
    required String otherId,
    required String content,
    bool isTransport = false,
  }) {
    _socket?.emit('send_message', {
      'orderId': orderId,
      'otherId': otherId,
      'content': content,
      'isTransport': isTransport,
    });
  }

  void onNewMessage(void Function(dynamic) handler) {
    _socket?.on('new_message', handler);
  }

  void offNewMessage(void Function(dynamic) handler) {
    _socket?.off('new_message', handler);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }
}

final chatSocketServiceProvider = Provider<ChatSocketService>((ref) {
  final storage = ref.watch(secureStorageProvider);
  final service = ChatSocketService(storage);
  ref.onDispose(service.disconnect);
  return service;
});
