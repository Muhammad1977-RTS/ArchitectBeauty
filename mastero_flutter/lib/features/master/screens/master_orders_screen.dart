import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/models/order.dart';
import '../../../core/providers/orders_provider.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/empty_illustration.dart';
import '../../../shared/widgets/order_status_chip.dart';

class MasterOrdersScreen extends ConsumerWidget {
  const MasterOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(allOrdersProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Доступные заказы')),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (orders) {
          final open = orders.where((o) => o.status == 'new').toList();
          if (open.isEmpty) {
            return const EmptyIllustration(
              asset: 'assets/images/empty-orders.svg',
              text: 'Нет доступных заказов',
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(allOrdersProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: open.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (ctx, i) => _MasterOrderCard(order: open[i]),
            ),
          );
        },
      ),
    );
  }
}

class _MasterOrderCard extends ConsumerStatefulWidget {
  final Order order;
  const _MasterOrderCard({required this.order});

  @override
  ConsumerState<_MasterOrderCard> createState() => _MasterOrderCardState();
}

class _MasterOrderCardState extends ConsumerState<_MasterOrderCard> {
  bool _expanded = false;
  final _priceCtrl = TextEditingController();
  final _commentCtrl = TextEditingController();
  bool _submitting = false;

  Future<void> _respond() async {
    final price = double.tryParse(_priceCtrl.text);
    if (price == null || price <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Введите корректную цену')),
      );
      return;
    }
    setState(() => _submitting = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.post('/responses', data: {
        'orderId': widget.order.id,
        'proposedPrice': price,
        'comment': _commentCtrl.text.trim().isEmpty ? null : _commentCtrl.text.trim(),
      });
      ref.invalidate(allOrdersProvider);
      if (mounted) {
        setState(() => _expanded = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Отклик отправлен!'), backgroundColor: AppColors.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('$e'), backgroundColor: AppColors.error));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final o = widget.order;
    return Card(
      child: Column(
        children: [
          InkWell(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            onTap: () => setState(() => _expanded = !_expanded),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(o.workType.name,
                            style: const TextStyle(
                                fontSize: 15, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 4),
                        Text(o.address,
                            style: const TextStyle(
                                color: AppColors.textSecondary, fontSize: 13),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                        Text('${o.areaSqm} м²',
                            style: const TextStyle(
                                color: AppColors.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                  Icon(_expanded ? Icons.expand_less : Icons.expand_more),
                ],
              ),
            ),
          ),
          if (_expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Column(
                children: [
                  if (o.description != null) ...[
                    Text(o.description!,
                        style: const TextStyle(color: AppColors.textSecondary)),
                    const SizedBox(height: 12),
                  ],
                  TextField(
                    controller: _priceCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Ваша цена (₽)',
                      suffixText: '₽',
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _commentCtrl,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Комментарий (необязательно)',
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _submitting ? null : _respond,
                      child: _submitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white))
                          : const Text('Откликнуться'),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
