import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../models/message.dart';

typedef ChatKey = ({String orderId, String otherId});

final chatMessagesProvider = FutureProvider.family<List<ChatMessage>, ChatKey>((ref, key) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/messages/order/${key.orderId}/master/${key.otherId}');
  return (res.data as List).map((j) => ChatMessage.fromJson(j as Map<String, dynamic>)).toList();
});

final transportChatMessagesProvider = FutureProvider.family<List<ChatMessage>, ChatKey>((ref, key) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/transport-messages/order/${key.orderId}/carrier/${key.otherId}');
  return (res.data as List).map((j) => ChatMessage.fromJson(j as Map<String, dynamic>)).toList();
});

final unreadCountProvider = FutureProvider<int>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/messages/unread');
  return res.data['count'] as int? ?? 0;
});
