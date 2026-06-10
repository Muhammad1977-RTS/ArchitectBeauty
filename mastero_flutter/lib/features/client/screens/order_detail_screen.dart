import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/models/order.dart';
import '../../../core/providers/orders_provider.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/order_status_chip.dart';

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
              _OrderInfoCard(order: order),
              const SizedBox(height: 16),

              // Мастер выбран — чат + завершить
              if (order.status == 'master_selected') ...[
                _MasterSelectedBanner(order: order),
                const SizedBox(height: 16),
              ],

              // Завершён — рейтинг
              if (order.status == 'completed') ...[
                _CompletedBanner(order: order),
                const SizedBox(height: 16),
              ],

              // Новый — список откликов
              if (order.status == 'new') ...[
                const Text('Отклики мастеров',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                responsesAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Text('$e'),
                  data: (responses) => responses.isEmpty
                      ? const Padding(
                          padding: EdgeInsets.all(24),
                          child: Center(
                            child: Text('Откликов пока нет',
                                style: TextStyle(color: AppColors.textSecondary)),
                          ),
                        )
                      : Column(
                          children: responses
                              .map((r) => _ResponseCard(
                                    response: r,
                                    orderId: orderId,
                                    onSelected: () {
                                      ref.invalidate(orderDetailProvider(orderId));
                                      ref.invalidate(myOrdersProvider);
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
  final Order order;
  const _OrderInfoCard({required this.order});

  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(order.workType.name,
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  ),
                  OrderStatusChip(status: order.status),
                ],
              ),
              const SizedBox(height: 12),
              _InfoRow(Icons.location_on, order.address),
              _InfoRow(Icons.square_foot, '${order.areaSqm} м²'),
              if (order.description != null) _InfoRow(Icons.description, order.description!),
            ],
          ),
        ),
      );
}

class _MasterSelectedBanner extends ConsumerWidget {
  final Order order;
  const _MasterSelectedBanner({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) => Card(
        color: AppColors.primary.withOpacity(0.07),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: AppColors.primary.withOpacity(0.3)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.handyman, color: AppColors.primary),
                  SizedBox(width: 10),
                  Text('Мастер выбран',
                      style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                          fontSize: 16)),
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
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(color: AppColors.primary),
                      ),
                      onPressed: order.masterId != null
                          ? () => context.push(
                              '/chat/${order.id}/${order.masterId}?name=${Uri.encodeComponent('Мастер')}')
                          : null,
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

  Future<void> _complete(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Завершить заказ?'),
        content: const Text('Подтвердите, что работа выполнена.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false), child: const Text('Отмена')),
          ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Завершить')),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;

    try {
      await ref.read(apiClientProvider).patch('/orders/${order.id}/complete');
      ref.invalidate(orderDetailProvider(order.id));
      ref.invalidate(myOrdersProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Заказ завершён!'), backgroundColor: AppColors.secondary),
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

class _CompletedBanner extends ConsumerWidget {
  final Order order;
  const _CompletedBanner({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) => Card(
        color: AppColors.secondary.withOpacity(0.07),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: AppColors.secondary.withOpacity(0.3)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.check_circle, color: AppColors.secondary, size: 24),
                  SizedBox(width: 10),
                  Text('Заказ завершён',
                      style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.secondary,
                          fontSize: 16)),
                ],
              ),
              const SizedBox(height: 12),
              if (order.rating != null) ...[
                Row(
                  children: [
                    ...List.generate(
                      5,
                      (i) => Icon(
                        i < order.rating! ? Icons.star : Icons.star_border,
                        size: 24,
                        color: AppColors.warning,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text('${order.rating}/5',
                        style: const TextStyle(
                            color: AppColors.textSecondary, fontSize: 14)),
                  ],
                ),
                if (order.reviewText != null && order.reviewText!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(order.reviewText!,
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 14)),
                ],
              ] else ...[
                ElevatedButton.icon(
                  icon: const Icon(Icons.star_outline, size: 16),
                  label: const Text('Оценить мастера'),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 44),
                    backgroundColor: AppColors.warning,
                  ),
                  onPressed: () => _showRatingSheet(context, ref),
                ),
              ],
            ],
          ),
        ),
      );

  void _showRatingSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _RatingSheet(
        title: 'Оценить мастера',
        onSubmit: (rating, review) async {
          await ref.read(apiClientProvider).patch(
            '/orders/${order.id}/rate',
            data: {'rating': rating, if (review.isNotEmpty) 'review_text': review},
          );
          ref.invalidate(orderDetailProvider(order.id));
          ref.invalidate(myOrdersProvider);
        },
      ),
    );
  }
}

class _ResponseCard extends ConsumerWidget {
  final OrderResponse response;
  final String orderId;
  final VoidCallback onSelected;
  const _ResponseCard(
      {required this.response, required this.orderId, required this.onSelected});

  @override
  Widget build(BuildContext context, WidgetRef ref) => Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const CircleAvatar(
                    radius: 18,
                    backgroundColor: AppColors.primary,
                    child: Icon(Icons.person, color: Colors.white, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(response.masterName,
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                  ),
                  Text(
                    '${response.proposedPrice.toStringAsFixed(0)} ₽',
                    style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary),
                  ),
                ],
              ),
              if (response.comment != null) ...[
                const SizedBox(height: 8),
                Text(response.comment!,
                    style: const TextStyle(color: AppColors.textSecondary)),
              ],
              if (response.estimatedDays != null) ...[
                const SizedBox(height: 4),
                Text('Срок: ${response.estimatedDays} дн.',
                    style:
                        const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.chat, size: 16),
                      label: const Text('Чат'),
                      style:
                          OutlinedButton.styleFrom(minimumSize: const Size(0, 42)),
                      onPressed: () => context.push(
                          '/chat/$orderId/${response.masterId}?name=${Uri.encodeComponent(response.masterName.isNotEmpty ? response.masterName : 'Мастер')}'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.check, size: 16),
                      label: const Text('Выбрать'),
                      style:
                          ElevatedButton.styleFrom(minimumSize: const Size(0, 42)),
                      onPressed: () => _selectMaster(context, ref),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );

  Future<void> _selectMaster(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(apiClientProvider).patch(
        '/orders/$orderId/select-master',
        data: {'master_id': response.masterId},
      );
      onSelected();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Мастер выбран!'), backgroundColor: AppColors.secondary),
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
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 16, color: AppColors.textSecondary),
            const SizedBox(width: 6),
            Expanded(
                child:
                    Text(text, style: const TextStyle(color: AppColors.textSecondary))),
          ],
        ),
      );
}

// Переиспользуется в транспортном экране
class _RatingSheet extends ConsumerStatefulWidget {
  final String title;
  final Future<void> Function(int rating, String review) onSubmit;
  const _RatingSheet({required this.title, required this.onSubmit});

  @override
  ConsumerState<_RatingSheet> createState() => _RatingSheetState();
}

class _RatingSheetState extends ConsumerState<_RatingSheet> {
  int _rating = 0;
  final _reviewCtrl = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _reviewCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_rating == 0) return;
    setState(() => _loading = true);
    try {
      await widget.onSubmit(_rating, _reviewCtrl.text.trim());
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding:
          EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(widget.title,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              5,
              (i) => GestureDetector(
                onTap: () => setState(() => _rating = i + 1),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Icon(
                    i < _rating ? Icons.star : Icons.star_border,
                    size: 40,
                    color: AppColors.warning,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _reviewCtrl,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText: 'Оставьте отзыв (необязательно)',
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: (_rating == 0 || _loading) ? null : _submit,
            child: _loading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('Отправить оценку'),
          ),
        ],
      ),
    );
  }
}
