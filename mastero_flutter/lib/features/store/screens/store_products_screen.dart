import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/models/product.dart';
import '../../../shared/theme/app_theme.dart';

final _myProductsProvider = FutureProvider<List<Product>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/products/my');
  return (res.data as List).map((j) => Product.fromJson(j as Map<String, dynamic>)).toList();
});

class StoreProductsScreen extends ConsumerWidget {
  const StoreProductsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(_myProductsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Мои товары'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddProduct(context, ref),
          ),
        ],
      ),
      body: productsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (products) {
          if (products.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.inventory_2_outlined, size: 64, color: AppColors.border),
                  const SizedBox(height: 16),
                  const Text('Нет товаров',
                      style: TextStyle(color: AppColors.textSecondary)),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.add),
                    label: const Text('Добавить товар'),
                    onPressed: () => _showAddProduct(context, ref),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(_myProductsProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: products.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) => _ProductCard(
                product: products[i],
                onDeleted: () => ref.invalidate(_myProductsProvider),
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddProduct(context, ref),
        backgroundColor: AppColors.store,
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddProduct(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _AddProductSheet(onAdded: () => ref.invalidate(_myProductsProvider)),
    );
  }
}

class _ProductCard extends ConsumerWidget {
  final Product product;
  final VoidCallback onDeleted;
  const _ProductCard({required this.product, required this.onDeleted});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                  if (product.description != null) ...[
                    const SizedBox(height: 4),
                    Text(product.description!,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        maxLines: 2),
                  ],
                  const SizedBox(height: 6),
                  Row(children: [
                    Text('${product.price.toStringAsFixed(0)} ₽/${product.unit}',
                        style: const TextStyle(
                            color: AppColors.store,
                            fontWeight: FontWeight.bold,
                            fontSize: 15)),
                    const SizedBox(width: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: product.inStock
                            ? AppColors.secondary.withOpacity(0.1)
                            : AppColors.error.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        product.inStock ? 'В наличии' : 'Нет',
                        style: TextStyle(
                            fontSize: 11,
                            color: product.inStock ? AppColors.secondary : AppColors.error),
                      ),
                    ),
                  ]),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline, color: AppColors.error),
              onPressed: () async {
                final api = ref.read(apiClientProvider);
                await api.delete('/products/${product.id}');
                onDeleted();
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _AddProductSheet extends ConsumerStatefulWidget {
  final VoidCallback onAdded;
  const _AddProductSheet({required this.onAdded});

  @override
  ConsumerState<_AddProductSheet> createState() => _AddProductSheetState();
}

class _AddProductSheetState extends ConsumerState<_AddProductSheet> {
  final _nameCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _unitCtrl = TextEditingController(text: 'шт');
  final _descCtrl = TextEditingController();
  bool _loading = false;

  Future<void> _submit() async {
    if (_nameCtrl.text.isEmpty || _priceCtrl.text.isEmpty) return;
    setState(() => _loading = true);
    try {
      await ref.read(apiClientProvider).post('/products', data: {
        'name': _nameCtrl.text.trim(),
        'price': double.parse(_priceCtrl.text),
        'unit': _unitCtrl.text.trim(),
        'description': _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
      });
      widget.onAdded();
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('$e'), backgroundColor: AppColors.error));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
          24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Добавить товар',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'Название')),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
              flex: 2,
              child: TextField(
                  controller: _priceCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Цена (₽)')),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                  controller: _unitCtrl,
                  decoration: const InputDecoration(labelText: 'Единица')),
            ),
          ]),
          const SizedBox(height: 12),
          TextField(
              controller: _descCtrl,
              maxLines: 2,
              decoration: const InputDecoration(labelText: 'Описание (необязательно)')),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _loading ? null : _submit,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.store),
              child: _loading
                  ? const SizedBox(
                      width: 20, height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Добавить'),
            ),
          ),
        ],
      ),
    );
  }
}
