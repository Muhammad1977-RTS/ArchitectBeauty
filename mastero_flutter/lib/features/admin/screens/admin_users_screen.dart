import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/models/user.dart';
import '../../../shared/theme/app_theme.dart';

final _usersProvider = FutureProvider.family<List<Map<String, dynamic>>, String?>((ref, role) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/admin/users', queryParameters: role != null ? {'role': role} : null);
  return (res.data as List).cast<Map<String, dynamic>>();
});

class AdminUsersScreen extends ConsumerStatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  ConsumerState<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends ConsumerState<AdminUsersScreen> {
  String? _roleFilter;

  static const _roleFilters = [
    (value: null, label: 'Все'),
    (value: 'client', label: 'Клиенты'),
    (value: 'master', label: 'Мастера'),
    (value: 'carrier', label: 'Перевозчики'),
    (value: 'store', label: 'Магазины'),
  ];

  @override
  Widget build(BuildContext context) {
    final usersAsync = ref.watch(_usersProvider(_roleFilter));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Пользователи'),
        backgroundColor: Colors.red.shade700,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _roleFilters.map((f) {
                  final selected = _roleFilter == f.value;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(f.label),
                      selected: selected,
                      selectedColor: Colors.red.shade100,
                      checkmarkColor: Colors.red.shade700,
                      onSelected: (_) => setState(() => _roleFilter = f.value),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: usersAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('$e')),
              data: (users) {
                if (users.isEmpty) {
                  return const Center(child: Text('Нет пользователей'));
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(_usersProvider(_roleFilter)),
                  child: ListView.separated(
                    itemCount: users.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (_, i) => _UserTile(
                      user: users[i],
                      onDeleted: () => ref.invalidate(_usersProvider(_roleFilter)),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _UserTile extends ConsumerWidget {
  final Map<String, dynamic> user;
  final VoidCallback onDeleted;
  const _UserTile({required this.user, required this.onDeleted});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = roleFromString(user['role'] as String? ?? 'client');
    final roleColors = {
      UserRole.client: AppColors.client,
      UserRole.master: AppColors.master,
      UserRole.carrier: AppColors.carrier,
      UserRole.store: AppColors.store,
    };
    final color = roleColors[role] ?? AppColors.primary;

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color.withOpacity(0.15),
        child: Text(
          (user['name'] as String? ?? '?')[0].toUpperCase(),
          style: TextStyle(color: color, fontWeight: FontWeight.bold),
        ),
      ),
      title: Text(user['name'] as String? ?? '—'),
      subtitle: Text(user['email'] as String? ?? ''),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(role.label,
                style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
            onPressed: () => _confirmDelete(context, ref),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Удалить пользователя?'),
        content: Text('${user['name']} (${user['email']}) будет удалён безвозвратно.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Отмена')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Удалить', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ref.read(apiClientProvider).delete('/admin/users/${user['id']}');
      onDeleted();
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e'), backgroundColor: AppColors.error),
        );
      }
    }
  }
}
