class TransportOrder {
  final String id;
  final String fromAddress;
  final String toAddress;
  final String cargoDescription;
  final double? cargoWeightKg;
  final double? cargoVolumeM3;
  final String? transportDate;
  final double? budget;
  final String status;
  final String clientId;
  final String? carrierId;
  final DateTime createdAt;
  final int? rating;

  const TransportOrder({
    required this.id,
    required this.fromAddress,
    required this.toAddress,
    required this.cargoDescription,
    this.cargoWeightKg,
    this.cargoVolumeM3,
    this.transportDate,
    this.budget,
    required this.status,
    required this.clientId,
    this.carrierId,
    required this.createdAt,
    this.rating,
  });

  factory TransportOrder.fromJson(Map<String, dynamic> j) => TransportOrder(
        id: j['id'] as String,
        fromAddress: j['from_address'] as String,
        toAddress: j['to_address'] as String,
        cargoDescription: j['cargo_description'] as String,
        cargoWeightKg: (j['cargo_weight_kg'] as num?)?.toDouble(),
        cargoVolumeM3: (j['cargo_volume_m3'] as num?)?.toDouble(),
        transportDate: j['transport_date'] as String?,
        budget: (j['budget'] as num?)?.toDouble(),
        status: j['status'] as String,
        clientId: j['client_id'] as String,
        carrierId: j['carrier_id'] as String?,
        createdAt: DateTime.parse(j['created_at'] as String),
        rating: j['rating'] as int?,
      );

  String get statusLabel => switch (status) {
        'open' => 'Открыт',
        'in_progress' => 'В работе',
        'completed' => 'Завершён',
        _ => status,
      };
}

class TransportResponse {
  final String id;
  final String orderId;
  final String carrierId;
  final String carrierName;
  final double proposedPrice;
  final String? comment;
  final String? vehicleType;
  final DateTime createdAt;

  const TransportResponse({
    required this.id,
    required this.orderId,
    required this.carrierId,
    required this.carrierName,
    required this.proposedPrice,
    this.comment,
    this.vehicleType,
    required this.createdAt,
  });

  factory TransportResponse.fromJson(Map<String, dynamic> j) => TransportResponse(
        id: j['id'] as String,
        orderId: j['order_id'] as String,
        carrierId: j['carrier_id'] as String,
        carrierName: (j['carrier'] as Map<String, dynamic>?)?['name'] as String? ?? '',
        proposedPrice: (j['proposed_price'] as num).toDouble(),
        comment: j['comment'] as String?,
        vehicleType: j['vehicle_type'] as String?,
        createdAt: DateTime.parse(j['created_at'] as String),
      );
}
