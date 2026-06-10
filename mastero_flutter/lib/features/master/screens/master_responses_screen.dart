import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/order.dart';
import '../../../core/providers/orders_provider.dart';
import '../../../shared/theme/app_theme.dart';

class MasterResponsesScreen extends ConsumerWidget {
  const MasterResponsesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final responsesAsync = ref.watch(myResponsesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Мои отклики')),
      body: responsesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (responses) {
          if (responses.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.reply_all, size: 64, color: AppColors.border),
                  SizedBox(height: 16),
                  Text('Вы ещё не откликались на заказы',
                      style: TextStyle(color: AppColors.textSecondary)),
                ],
              ),
            );
          }

          // Sort: selected/completed first, then by date
          final sorted = [...responses]..sort((a, b) {
              if (a.isSelected && !b.isSelected) return -1;
              if (!a.isSelected && b.isSelected) return 1;
              return b.createdAt.compareTo(a.createdAt);
            });

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(myResponsesProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: sorted.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (ctx, i) => _ResponseCard(response: sorted[i]),
            ),
          );
        },
      ),
    );
  }
}

class _ResponseCard extends StatelessWidget {
  final OrderResponse response;
  const _ResponseCard({required this.response});

  @override
  Widget build(BuildContext context) {
    final r = response;
    final selected = r.isSelected;
    final completed = r.orderStatus == 'completed';

    return Card(
      shape: selected
          ? RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(
                color: completed ? AppColors.secondary : AppColors.primary,
                width: 1.5,
              ),
            )
          : null,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row: title + status badge
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    r.orderWorkTypeName ?? 'Заказ #${r.orderId.substring(0, 8)}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 15),
                  ),
                ),
                const SizedBox(width: 8),
                if (selected) _StatusBadge(completed: completed),
              ],
            ),

            // Address
            if (r.orderAddress != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 13,
                      color: AppColors.textSecondary),
                  const SizedBox(width: 3),
                  Expanded(
                    child: Text(r.orderAddress!,
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.textSecondary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                  ),
                ],
              ),
            ],

            const SizedBox(height: 8),

            // Price row
            Row(
              children: [
                const Icon(Icons.payments_outlined,
                    size: 15, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text('Ваша цена: ',
                    style: const TextStyle(
                        fontSize: 13, color: AppColors.textSecondary)),
                Text('${r.proposedPrice.toStringAsFixed(0)} ₽',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                        fontSize: 15)),
              ],
            ),

            if (r.comment != null) ...[
              const SizedBox(height: 6),
              Text(r.comment!,
                  style: const TextStyle(
                      color: AppColors.textSecondary, fontSize: 13)),
            ],

            if (r.estimatedDays != null) ...[
              const SizedBox(height: 4),
              Text('Срок: ${r.estimatedDays} дн.',
                  style: const TextStyle(
                      fontSize: 12, color: AppColors.textSecondary)),
            ],

            const SizedBox(height: 12),

            // Chat button — always available, styling depends on selection
            SizedBox(
              width: double.infinity,
              child: selected
                  ? ElevatedButton.icon(
                      icon: const Icon(Icons.chat, size: 16),
                      label: Text(completed ? 'Чат (завершён)' : 'Открыть чат'),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(0, 42),
                        backgroundColor:
                            completed ? AppColors.secondary : AppColors.primary,
                      ),
                      onPressed: () => _openChat(context, r),
                    )
                  : OutlinedButton.icon(
                      icon: const Icon(Icons.chat, size: 16),
                      label: const Text('Открыть чат'),
                      style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 42)),
                      onPressed: () => _openChat(context, r),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _openChat(BuildContext context, OrderResponse r) {
    final encodedTitle = Uri.encodeComponent(
        r.orderWorkTypeName != null ? 'Клиент (${r.orderWorkTypeName})' : 'Клиент');
    context.push('/chat/${r.orderId}/${r.masterId}?name=$encodedTitle');
  }
}

class _StatusBadge extends StatelessWidget {
  final bool completed;
  const _StatusBadge({required this.completed});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: completed
            ? AppColors.secondary.withOpacity(0.12)
            : AppColors.primary.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: completed ? AppColors.secondary : AppColors.primary,
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            completed ? Icons.check_circle : Icons.star,
            size: 12,
            color: completed ? AppColors.secondary : AppColors.primary,
          ),
          const SizedBox(width: 4),
          Text(
            completed ? 'Завершён' : 'Выбран!',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: completed ? AppColors.secondary : AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}
