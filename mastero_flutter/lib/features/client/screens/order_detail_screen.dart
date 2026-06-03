import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/providers/orders_provider.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/order_status_chip.dart';
import '../../../shared/widgets/loading_button.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderDetailProvider(orderId));
    final responsesAsync = ref.watch(orderResponsesProvider(orderId));

    return Scaffold(
      appBar: AppBar(title: const Text('Заказ')),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (order) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(orderDetailProvider(orderId));
            ref.invalidate(orderResponsesProvider(orderId));
          },
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        Expanded(
                          child: Text(order.workType.name,
                              style: const TextStyle(
                                  fontSize: 20, fontWeight: FontWeight.bold)),
                        ),
                        OrderStatusChip(status: order.status),
                      ]),
                      const SizedBox(height: 12),
                      _InfoRow(Icons.location_on, order.address),
                      _InfoRow(Icons.square_foot, '${order.areaSqm} м²'),
                      if (order.description != null)
                        _InfoRow(Icons.description, order.description!),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Отклики мастеров',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              responsesAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Text('$e'),
                data: (responses) {
                  if (responses.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.all(24),
                      child: Center(
                          child: Text('Откликов пока нет',
                              style: TextStyle(color: AppColors.textSecondary))),
                    );
                  }
                  return Column(
                    children: responses.map((r) {
                      final canSelect = order.status == 'open';
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: [
                                const CircleAvatar(
                                  radius: 18,
                                  backgroundColor: AppColors.primary,
                                  child: Icon(Icons.person, color: Colors.white, size: 18),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(r.masterName,
                                      style: const TextStyle(fontWeight: FontWeight.w600)),
                                ),
                                Text(
                                  '${r.proposedPrice.toStringAsFixed(0)} ₽',
                                  style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary),
                                ),
                              ]),
                              if (r.comment != null) ...[
                                const SizedBox(height: 8),
                                Text(r.comment!,
                                    style: const TextStyle(color: AppColors.textSecondary)),
                              ],
                              if (r.estimatedDays != null) ...[
                                const SizedBox(height: 4),
                                Text('Срок: ${r.estimatedDays} дн.',
                                    style: const TextStyle(
                                        fontSize: 12, color: AppColors.textSecondary)),
                              ],
                              if (canSelect) ...[
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(
                                      child: OutlinedButton.icon(
                                        icon: const Icon(Icons.chat, size: 16),
                                        label: const Text('Чат'),
                                        onPressed: () => context.push(
                                            '/chat/${order.id}/${r.masterId}'),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: ElevatedButton.icon(
                                        icon: const Icon(Icons.check, size: 16),
                                        label: const Text('Выбрать'),
                                        onPressed: () =>
                                            _selectMaster(context, ref, order.id, r.masterId),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _selectMaster(
      BuildContext context, WidgetRef ref, String orderId, String masterId) async {
    try {
      final api = ref.read(apiClientProvider);
      await api.patch('/orders/$orderId/select-master', data: {'master_id': masterId});
      ref.invalidate(orderDetailProvider(orderId));
      ref.invalidate(myOrdersProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Мастер выбран!'), backgroundColor: AppColors.secondary),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e'), backgroundColor: AppColors.error),
        );
      }
    }
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoRow(this.icon, this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: AppColors.textSecondary),
          const SizedBox(width: 6),
          Expanded(child: Text(text, style: const TextStyle(color: AppColors.textSecondary))),
        ],
      ),
    );
  }
}
