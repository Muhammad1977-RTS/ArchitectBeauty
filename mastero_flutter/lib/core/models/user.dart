enum UserRole { client, master, carrier, store }

extension UserRoleExt on UserRole {
  String get label => switch (this) {
        UserRole.client => 'Клиент',
        UserRole.master => 'Мастер',
        UserRole.carrier => 'Перевозчик',
        UserRole.store => 'Магазин',
      };

  String get value => name;
}

UserRole roleFromString(String s) =>
    UserRole.values.firstWhere((r) => r.name == s, orElse: () => UserRole.client);

class User {
  final String id;
  final String email;
  final String name;
  final UserRole role;
  final bool isAdmin;
  final String? phone;
  final String? cityDistrict;
  final String? avatarUrl;

  const User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.isAdmin = false,
    this.phone,
    this.cityDistrict,
    this.avatarUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as String,
        email: json['email'] as String,
        name: json['name'] as String,
        role: roleFromString(json['role'] as String),
        isAdmin: json['is_admin'] as bool? ?? false,
        phone: json['phone'] as String?,
        cityDistrict: json['city_district'] as String?,
        avatarUrl: json['avatar_url'] as String?,
      );

  User copyWith({
    String? name,
    String? phone,
    String? cityDistrict,
    String? avatarUrl,
  }) =>
      User(
        id: id,
        email: email,
        name: name ?? this.name,
        role: role,
        isAdmin: isAdmin,
        phone: phone ?? this.phone,
        cityDistrict: cityDistrict ?? this.cityDistrict,
        avatarUrl: avatarUrl ?? this.avatarUrl,
      );
}
