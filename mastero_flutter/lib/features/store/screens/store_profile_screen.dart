import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/models/product.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../shared/theme/app_theme.dart';

final storeProfileProvider = FutureProvider<StoreProfile?>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final res = await api.get('/store/profile');
    return StoreProfile.fromJson(res.data as Map<String, dynamic>);
  } catch (_) {
    return null;
  }
});

class StoreProfileScreen extends ConsumerStatefulWidget {
  const StoreProfileScreen({super.key});

  @override
  ConsumerState<StoreProfileScreen> createState() => _StoreProfileScreenState();
}

class _StoreProfileScreenState extends ConsumerState<StoreProfileScreen> {
  final _storeNameCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  bool _loaded = false;
  bool _saving = false;

  void _initFields(StoreProfile? profile) {
    if (_loaded) return;
    _loaded = true;
    _storeNameCtrl.text = profile?.storeName ?? '';
    _addressCtrl.text = profile?.address ?? '';
    _descCtrl.text = profile?.description ?? '';
    final user = ref.read(currentUserProvider);
    _phoneCtrl.text = profile?.phone ?? user?.phone ?? '';
  }

  Future<void> _save() async {
    if (_storeNameCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Введите название магазина')),
      );
      return;
    }
    setState(() => _saving = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.patch('/store/profile', data: {
        'store_name': _storeNameCtrl.text.trim(),
        if (_addressCtrl.text.trim().isNotEmpty)
          'address': _addressCtrl.text.trim(),
        if (_descCtrl.text.trim().isNotEmpty)
          'description': _descCtrl.text.trim(),
      });
      if (_phoneCtrl.text.trim().isNotEmpty) {
        await api.patch('/profiles/me', data: {
          'phone': _phoneCtrl.text.trim(),
        });
        await ref.read(authProvider.notifier).refreshProfile();
      }
      ref.invalidate(storeProfileProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Профиль сохранён'),
            backgroundColor: AppColors.secondary,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  void dispose() {
    _storeNameCtrl.dispose();
    _addressCtrl.dispose();
    _descCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(storeProfileProvider);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Профиль магазина')),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (profile) {
          _initFields(profile);
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Store avatar
                Center(
                  child: CircleAvatar(
                    radius: 40,
                    backgroundColor: AppColors.store.withOpacity(0.15),
                    child: const Icon(Icons.storefront, size: 40, color: AppColors.store),
                  ),
                ),
                const SizedBox(height: 24),

                // Store info section
                const _SectionHeader('Информация о магазине'),
                const SizedBox(height: 12),
                TextField(
                  controller: _storeNameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Название магазина *',
                    prefixIcon: Icon(Icons.store),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _addressCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Адрес',
                    prefixIcon: Icon(Icons.location_on_outlined),
                    hintText: 'ул. Примерная, д. 1',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _descCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Описание',
                    hintText: 'Расскажите о вашем магазине...',
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 24),

                // Contact section
                const _SectionHeader('Контакт'),
                const SizedBox(height: 4),
                const Text(
                  'Телефон будет показан покупателям на карточках товаров',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Телефон',
                    prefixIcon: Icon(Icons.phone_outlined),
                    hintText: '+7 (999) 000-00-00',
                  ),
                ),
                const SizedBox(height: 28),

                ElevatedButton(
                  onPressed: _saving ? null : _save,
                  style:
                      ElevatedButton.styleFrom(backgroundColor: AppColors.store),
                  child: _saving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Text('Сохранить'),
                ),
                const SizedBox(height: 40),

                // Personal info (read-only)
                const _SectionHeader('Аккаунт'),
                const SizedBox(height: 12),
                if (user != null) ...[
                  _InfoTile(Icons.person_outline, 'Имя', user.name),
                  const SizedBox(height: 8),
                  _InfoTile(Icons.email_outlined, 'Email', user.email),
                ],
                const SizedBox(height: 20),
                OutlinedButton.icon(
                  icon: const Icon(Icons.logout, color: AppColors.error),
                  label: const Text('Выйти',
                      style: TextStyle(color: AppColors.error)),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 48),
                    side: const BorderSide(color: AppColors.error),
                  ),
                  onPressed: () => ref.read(authProvider.notifier).logout(),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String text;
  const _SectionHeader(this.text);

  @override
  Widget build(BuildContext context) => Text(
        text,
        style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
            letterSpacing: 0.5),
      );
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoTile(this.icon, this.label, this.value);

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: AppColors.textSecondary),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        fontSize: 11, color: AppColors.textSecondary)),
                Text(value,
                    style: const TextStyle(fontWeight: FontWeight.w500)),
              ],
            ),
          ],
        ),
      );
}
