import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/models/transport_order.dart';
import '../../../core/providers/transport_provider.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/empty_illustration.dart';
import '../../../shared/widgets/order_status_chip.dart';

class CarrierOrdersScreen extends ConsumerWidget {
  const CarrierOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(allTransportOrdersProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Грузоперевозки')),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (orders) {
          final open = orders.where((o) => o.status == 'new').toList();
          if (open.isEmpty) {
            return const EmptyIllustration(
              asset: 'assets/images/empty-transport.svg',
              text: 'Нет доступных заказов на перевозку',
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(allTransportOrdersProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: open.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (ctx, i) => _TransportCard(order: open[i]),
            ),
          );
        },
      ),
    );
  }
}

class _TransportCard extends ConsumerStatefulWidget {
  final TransportOrder order;
  const _TransportCard({required this.order});

  @override
  ConsumerState<_TransportCard> createState() => _TransportCardState();
}

class _TransportCardState extends ConsumerState<_TransportCard> {
  bool _expanded = false;
  final _priceCtrl = TextEditingController();
  final _commentCtrl = TextEditingController();
  bool _submitting = false;

  Future<void> _respond() async {
    final price = double.tryParse(_priceCtrl.text);
    if (price == null || price <= 0) return;
    setState(() => _submitting = true);
    try {
      await ref.read(apiClientProvider).post('/transport-responses', data: {
        'order_id': widget.order.id,
        'proposed_price': price,
        'comment': _commentCtrl.text.trim().isEmpty ? null : _commentCtrl.text.trim(),
      });
      ref.invalidate(allTransportOrdersProvider);
      if (mounted) {
        setState(() => _expanded = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Отклик отправлен!'), backgroundColor: AppColors.secondary),
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
            onTap: () => setState(() => _expanded = !_expanded),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    const Icon(Icons.local_shipping, color: AppColors.warning, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(o.cargoDescription,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ),
                    Icon(_expanded ? Icons.expand_less : Icons.expand_more),
                  ]),
                  const SizedBox(height: 8),
                  Row(children: [
                    const Icon(Icons.arrow_upward, size: 14, color: AppColors.secondary),
                    const SizedBox(width: 4),
                    Expanded(child: Text(o.fromAddress,
                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary))),
                  ]),
                  Row(children: [
                    const Icon(Icons.arrow_downward, size: 14, color: AppColors.error),
                    const SizedBox(width: 4),
                    Expanded(child: Text(o.toAddress,
                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary))),
                  ]),
                  if (o.budget != null) ...[
                    const SizedBox(height: 4),
                    Text('Бюджет: ${o.budget!.toStringAsFixed(0)} ₽',
                        style: const TextStyle(
                            fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w600)),
                  ],
                ],
              ),
            ),
          ),
          if (_expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Column(
                children: [
                  if (o.cargoWeightKg != null)
                    Text('Вес: ${o.cargoWeightKg} кг',
                        style: const TextStyle(color: AppColors.textSecondary)),
                  if (o.transportDate != null)
                    Text('Дата: ${o.formattedTransportDate}',
                        style: const TextStyle(color: AppColors.textSecondary)),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _priceCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                        labelText: 'Ваша цена (₽)', suffixText: '₽'),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _commentCtrl,
                    maxLines: 2,
                    decoration:
                        const InputDecoration(labelText: 'Комментарий (необязательно)'),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _submitting ? null : _respond,
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.warning),
                      child: _submitting
                          ? const SizedBox(
                              width: 20, height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
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
