class ChatMessage {
  final String id;
  final String orderId;
  final String senderId;
  final String senderName;
  final String content;
  final bool isRead;
  final DateTime createdAt;

  const ChatMessage({
    required this.id,
    required this.orderId,
    required this.senderId,
    required this.senderName,
    required this.content,
    required this.isRead,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> j) => ChatMessage(
        id: j['id'] as String,
        orderId: j['order_id'] as String,
        senderId: j['sender_id'] as String,
        senderName: (j['sender'] as Map<String, dynamic>?)?['name'] as String? ?? '',
        content: j['content'] as String,
        isRead: j['is_read'] as bool? ?? false,
        createdAt: DateTime.parse(j['created_at'] as String),
      );
}
