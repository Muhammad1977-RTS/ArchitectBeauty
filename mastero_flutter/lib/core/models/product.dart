class Product {
  final String id;
  final String name;
  final String? description;
  final double price;
  final String unit;
  final String? category;
  final bool inStock;
  final String storeId;
  final DateTime createdAt;

  const Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.unit,
    this.category,
    required this.inStock,
    required this.storeId,
    required this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> j) => Product(
        id: j['id'] as String,
        name: j['name'] as String,
        description: j['description'] as String?,
        price: (j['price'] as num).toDouble(),
        unit: j['unit'] as String,
        category: j['category'] as String?,
        inStock: j['in_stock'] as bool? ?? true,
        storeId: j['store_id'] as String,
        createdAt: DateTime.parse(j['created_at'] as String),
      );
}

class StoreProfile {
  final String id;
  final String storeName;
  final String? address;
  final String? description;
  final String? phone;
  final String ownerId;

  const StoreProfile({
    required this.id,
    required this.storeName,
    this.address,
    this.description,
    this.phone,
    required this.ownerId,
  });

  factory StoreProfile.fromJson(Map<String, dynamic> j) => StoreProfile(
        id: j['id'] as String,
        storeName: j['store_name'] as String,
        address: j['address'] as String?,
        description: j['description'] as String?,
        phone: j['phone'] as String?,
        ownerId: j['owner_id'] as String,
      );
}
