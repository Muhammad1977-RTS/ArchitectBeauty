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
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(myResponsesProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: responses.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (ctx, i) {
                final r = responses[i];
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          Expanded(
                            child: Text('Заказ #${r.orderId.substring(0, 8)}',
                                style: const TextStyle(fontWeight: FontWeight.w600)),
                          ),
                          Text('${r.proposedPrice.toStringAsFixed(0)} ₽',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primary,
                                  fontSize: 16)),
                        ]),
                        if (r.comment != null) ...[
                          const SizedBox(height: 6),
                          Text(r.comment!,
                              style: const TextStyle(color: AppColors.textSecondary)),
                        ],
                        const SizedBox(height: 10),
                        OutlinedButton.icon(
                          icon: const Icon(Icons.chat, size: 16),
                          label: const Text('Открыть чат'),
                          onPressed: () =>
                              context.push('/chat/${r.orderId}/${r.masterId}'),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
