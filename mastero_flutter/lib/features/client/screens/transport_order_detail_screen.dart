import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/models/transport_order.dart';
import '../../../core/providers/transport_provider.dart';
import '../../../shared/theme/app_theme.dart';

class TransportOrderDetailScreen extends ConsumerWidget {
  final String orderId;
  const TransportOrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(transportOrderDetailProvider(orderId));
    final responsesAsync = ref.watch(transportResponsesProvider(orderId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Перевозка'),
        leading: const BackButton(),
      ),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (order) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(transportOrderDetailProvider(orderId));
            ref.invalidate(transportResponsesProvider(orderId));
          },
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _OrderInfoCard(order: order),
              const SizedBox(height: 16),
              if (order.status == 'carrier_selected') ...[
                _CarrierSelectedBanner(order: order),
                const SizedBox(height: 16),
              ],
              if (order.status == 'completed') ...[
                _CompletedBanner(order: order),
                const SizedBox(height: 16),
              ],
              if (order.status == 'new') ...[
                const Text('Отклики перевозчиков',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                responsesAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Text('$e'),
                  data: (responses) => responses.isEmpty
                      ? const Padding(
                          padding: EdgeInsets.all(24),
                          child: Center(
                            child: Text(
                              'Откликов пока нет',
                              style: TextStyle(color: AppColors.textSecondary),
                            ),
                          ),
                        )
                      : Column(
                          children: responses
                              .map((r) => _ResponseCard(
                                    response: r,
                                    orderId: orderId,
                                    onSelected: () {
                                      ref.invalidate(transportOrderDetailProvider(orderId));
                                      ref.invalidate(myTransportOrdersProvider);
                                    },
                                  ))
                              .toList(),
                        ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _OrderInfoCard extends StatelessWidget {
  final TransportOrder order;
  const _OrderInfoCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final statusColor = switch (order.status) {
      'new' => AppColors.secondary,
      'carrier_selected' => AppColors.warning,
      'completed' => AppColors.textSecondary,
      _ => AppColors.error,
    };

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    order.cargoDescription,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    order.statusLabel,
                    style: TextStyle(
                        fontSize: 12, color: statusColor, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _InfoRow(
              icon: Icons.arrow_upward,
              color: AppColors.secondary,
              label: 'Откуда',
              text: order.fromAddress,
            ),
            const SizedBox(height: 8),
            _InfoRow(
              icon: Icons.arrow_downward,
              color: AppColors.error,
              label: 'Куда',
              text: order.toAddress,
            ),
            if (order.cargoWeightKg != null || order.cargoVolumeM3 != null) ...[
              const Divider(height: 20),
              Row(
                children: [
                  if (order.cargoWeightKg != null) ...[
                    const Icon(Icons.scale_outlined,
                        size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text('${order.cargoWeightKg} кг',
                        style: const TextStyle(color: AppColors.textSecondary)),
                    const SizedBox(width: 16),
                  ],
                  if (order.cargoVolumeM3 != null) ...[
                    const Icon(Icons.straighten, size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text('${order.cargoVolumeM3} м³',
                        style: const TextStyle(color: AppColors.textSecondary)),
                  ],
                ],
              ),
            ],
            if (order.budget != null || order.transportDate != null) ...[
              const Divider(height: 20),
              Row(
                children: [
                  if (order.budget != null) ...[
                    const Icon(Icons.payments_outlined,
                        size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      '${order.budget!.toStringAsFixed(0)} ₽',
                      style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                          fontSize: 15),
                    ),
                    const SizedBox(width: 16),
                  ],
                  if (order.transportDate != null) ...[
                    const Icon(Icons.calendar_today,
                        size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(order.transportDate!,
                        style: const TextStyle(color: AppColors.textSecondary)),
                  ],
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final String text;
  const _InfoRow(
      {required this.icon, required this.color, required this.label, required this.text});

  @override
  Widget build(BuildContext context) => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                Text(text, style: const TextStyle(fontSize: 14)),
              ],
            ),
          ),
        ],
      );
}

class _ResponseCard extends ConsumerWidget {
  final TransportResponse response;
  final String orderId;
  final VoidCallback onSelected;
  const _ResponseCard(
      {required this.response, required this.orderId, required this.onSelected});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: AppColors.carrier.withOpacity(0.15),
                  child: const Icon(Icons.local_shipping, color: AppColors.carrier, size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        response.carrierName.isNotEmpty
                            ? response.carrierName
                            : 'Перевозчик',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      if (response.vehicleType != null)
                        Text(
                          _vehicleLabel(response.vehicleType!),
                          style: const TextStyle(
                              fontSize: 12, color: AppColors.textSecondary),
                        ),
                    ],
                  ),
                ),
                Text(
                  '${response.proposedPrice.toStringAsFixed(0)} ₽',
                  style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: AppColors.carrier),
                ),
              ],
            ),
            if (response.comment != null && response.comment!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(response.comment!,
                  style: const TextStyle(color: AppColors.textSecondary)),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.chat, size: 16),
                    label: const Text('Чат'),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 42),
                    ),
                    onPressed: () => context.push(
                        '/chat/$orderId/${response.carrierId}?transport=true'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.check, size: 16),
                    label: const Text('Выбрать'),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(0, 42),
                      backgroundColor: AppColors.carrier,
                    ),
                    onPressed: () =>
                        _selectCarrier(context, ref, response.carrierId),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _selectCarrier(
      BuildContext context, WidgetRef ref, String carrierId) async {
    try {
      await ref.read(apiClientProvider).patch(
        '/transport-orders/$orderId/select-carrier',
        data: {'carrier_id': carrierId},
      );
      onSelected();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Перевозчик выбран!'),
            backgroundColor: AppColors.carrier,
          ),
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

  String _vehicleLabel(String type) => switch (type) {
        'car' => 'Легковой',
        'minivan' => 'Минивэн',
        'gazelle' => 'Газель',
        'truck' => 'Грузовик',
        _ => type,
      };
}

class _CarrierSelectedBanner extends ConsumerWidget {
  final TransportOrder order;
  const _CarrierSelectedBanner({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      color: AppColors.carrier.withOpacity(0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: AppColors.carrier.withOpacity(0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: const [
                Icon(Icons.local_shipping, color: AppColors.carrier),
                SizedBox(width: 10),
                Text(
                  'Перевозчик выбран',
                  style: TextStyle(
                      fontWeight: FontWeight.w600, color: AppColors.carrier, fontSize: 16),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.chat, size: 16),
                    label: const Text('Чат'),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 44),
                      foregroundColor: AppColors.carrier,
                      side: const BorderSide(color: AppColors.carrier),
                    ),
                    onPressed: () => context.push(
                        '/chat/${order.id}/${order.selectedCarrierId}?transport=true'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.done_all, size: 16),
                    label: const Text('Завершить'),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(0, 44),
                      backgroundColor: AppColors.secondary,
                    ),
                    onPressed: () => _complete(context, ref),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _complete(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Завершить заказ?'),
        content: const Text('Подтвердите, что груз доставлен.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Отмена')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Завершить'),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;

    try {
      await ref.read(apiClientProvider).patch('/transport-orders/${order.id}/complete');
      ref.invalidate(transportOrderDetailProvider(order.id));
      ref.invalidate(myTransportOrdersProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Заказ завершён!'),
            backgroundColor: AppColors.secondary,
          ),
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

class _CompletedBanner extends StatelessWidget {
  final TransportOrder order;
  const _CompletedBanner({required this.order});

  @override
  Widget build(BuildContext context) => Card(
        color: AppColors.secondary.withOpacity(0.08),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: AppColors.secondary.withOpacity(0.3)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              const Icon(Icons.check_circle, color: AppColors.secondary, size: 28),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Заказ завершён',
                      style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.secondary,
                          fontSize: 16)),
                  if (order.rating != null)
                    Row(
                      children: List.generate(
                        5,
                        (i) => Icon(
                          i < order.rating! ? Icons.star : Icons.star_border,
                          size: 18,
                          color: AppColors.warning,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      );
}
