import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/providers/orders_provider.dart';
import '../../../shared/theme/app_theme.dart';

class AdminWorkTypesScreen extends ConsumerStatefulWidget {
  const AdminWorkTypesScreen({super.key});

  @override
  ConsumerState<AdminWorkTypesScreen> createState() => _AdminWorkTypesScreenState();
}

class _AdminWorkTypesScreenState extends ConsumerState<AdminWorkTypesScreen> {
  final _nameCtrl = TextEditingController();
  final _slugCtrl = TextEditingController();
  bool _adding = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _slugCtrl.dispose();
    super.dispose();
  }

  String _toSlug(String name) =>
      name.toLowerCase().trim().replaceAll(RegExp(r'\s+'), '_').replaceAll(RegExp(r'[^\w_]'), '');

  Future<void> _add() async {
    if (_nameCtrl.text.trim().isEmpty) return;
    setState(() => _adding = true);
    try {
      await ref.read(apiClientProvider).post('/work-types', data: {
        'name': _nameCtrl.text.trim(),
        'slug': _slugCtrl.text.trim().isEmpty
            ? _toSlug(_nameCtrl.text)
            : _slugCtrl.text.trim(),
      });
      _nameCtrl.clear();
      _slugCtrl.clear();
      ref.invalidate(workTypesProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _adding = false);
    }
  }

  Future<void> _delete(String id) async {
    try {
      await ref.read(apiClientProvider).delete('/work-types/$id');
      ref.invalidate(workTypesProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final typesAsync = ref.watch(workTypesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Виды работ'),
        backgroundColor: Colors.red.shade700,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Добавить вид работ',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                const SizedBox(height: 10),
                Row(children: [
                  Expanded(
                    flex: 2,
                    child: TextField(
                      controller: _nameCtrl,
                      decoration: const InputDecoration(
                          labelText: 'Название', hintText: 'Укладка плитки'),
                      onChanged: (v) {
                        if (_slugCtrl.text.isEmpty) {
                          setState(() {});
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _slugCtrl,
                      decoration: InputDecoration(
                        labelText: 'Slug',
                        hintText: _toSlug(_nameCtrl.text),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: _adding ? null : _add,
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red.shade700,
                        minimumSize: const Size(56, 52)),
                    child: _adding
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.add, color: Colors.white),
                  ),
                ]),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: typesAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('$e')),
              data: (types) {
                if (types.isEmpty) {
                  return const Center(child: Text('Нет видов работ'));
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(workTypesProvider),
                  child: ListView.separated(
                    itemCount: types.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (_, i) {
                      final t = types[i];
                      return ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Color(0x1AEF4444),
                          child: Icon(Icons.build, color: Colors.red, size: 18),
                        ),
                        title: Text(t.name),
                        subtitle: Text(t.slug,
                            style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                                fontFamily: 'monospace')),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete_outline, color: AppColors.error),
                          onPressed: () => _confirmDelete(context, t.id, t.name),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context, String id, String name) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Удалить вид работ?'),
        content: Text('«$name» будет удалён. Это затронет существующие заказы.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Отмена')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Удалить', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
    if (confirmed == true) _delete(id);
  }
}
