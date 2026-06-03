class WorkType {
  final String id;
  final String name;
  final String slug;
  const WorkType({required this.id, required this.name, required this.slug});

  factory WorkType.fromJson(Map<String, dynamic> j) => WorkType(
        id: j['id'] as String,
        name: j['name'] as String,
        slug: j['slug'] as String,
      );
}

class Order {
  final String id;
  final String address;
  final double areaSqm;
  final String? description;
  final String status;
  final WorkType workType;
  final String clientId;
  final String? masterId;
  final List<String> photoUrls;
  final DateTime createdAt;
  final int? rating;
  final String? reviewText;

  const Order({
    required this.id,
    required this.address,
    required this.areaSqm,
    this.description,
    required this.status,
    required this.workType,
    required this.clientId,
    this.masterId,
    required this.photoUrls,
    required this.createdAt,
    this.rating,
    this.reviewText,
  });

  factory Order.fromJson(Map<String, dynamic> j) => Order(
        id: j['id'] as String,
        address: j['address'] as String,
        areaSqm: (j['area_sqm'] as num).toDouble(),
        description: j['description'] as String?,
        status: j['status'] as String,
        workType: WorkType.fromJson(j['work_type'] as Map<String, dynamic>),
        clientId: j['client_id'] as String,
        masterId: j['selected_master_id'] as String?,
        photoUrls: (j['photo_urls'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList() ??
            [],
        createdAt: DateTime.parse(j['created_at'] as String),
        rating: j['rating'] as int?,
        reviewText: j['review_text'] as String?,
      );

  String get statusLabel => switch (status) {
        'new' => 'Новый',
        'master_selected' => 'Мастер выбран',
        'completed' => 'Завершён',
        'cancelled' => 'Отменён',
        _ => status,
      };
}

class OrderResponse {
  final String id;
  final String orderId;
  final String masterId;
  final String masterName;
  final double proposedPrice;
  final String? comment;
  final int? estimatedDays;
  final DateTime createdAt;

  const OrderResponse({
    required this.id,
    required this.orderId,
    required this.masterId,
    required this.masterName,
    required this.proposedPrice,
    this.comment,
    this.estimatedDays,
    required this.createdAt,
  });

  factory OrderResponse.fromJson(Map<String, dynamic> j) => OrderResponse(
        id: j['id'] as String,
        orderId: j['order_id'] as String,
        masterId: j['master_id'] as String,
        masterName: (j['master'] as Map<String, dynamic>?)?['name'] as String? ?? '',
        proposedPrice: (j['proposed_price'] as num).toDouble(),
        comment: j['comment'] as String?,
        estimatedDays: j['estimated_days'] as int?,
        createdAt: DateTime.parse(j['created_at'] as String),
      );
}
