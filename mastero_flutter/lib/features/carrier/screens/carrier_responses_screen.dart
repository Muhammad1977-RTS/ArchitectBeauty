import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/transport_order.dart';
import '../../../core/providers/transport_provider.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/empty_illustration.dart';

class CarrierResponsesScreen extends ConsumerWidget {
  const CarrierResponsesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final responsesAsync = ref.watch(myTransportResponsesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Мои отклики')),
      body: responsesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text('$e', textAlign: TextAlign.center),
              TextButton(
                onPressed: () => ref.invalidate(myTransportResponsesProvider),
                child: const Text('Повторить'),
              ),
            ],
          ),
        ),
        data: (responses) {
          if (responses.isEmpty) {
            return const EmptyIllustration(
              asset: 'assets/images/empty-transport.svg',
              text: 'Вы ещё не откликались\nПерейдите во вкладку «Заказы»',
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(myTransportResponsesProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: responses.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) => _ResponseCard(response: responses[i]),
            ),
          );
        },
      ),
    );
  }
}

class _ResponseCard extends StatelessWidget {
  final TransportResponse response;
  const _ResponseCard({required this.response});

  @override
  Widget build(BuildContext context) {
    final statusColor = switch (response.status) {
      'selected' => AppColors.secondary,
      'rejected' => AppColors.error,
      _ => AppColors.textSecondary,
    };

    final order = response.order;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    order != null ? order.cargoDescription : 'Заказ на перевозку',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    response.statusLabel,
                    style: TextStyle(
                        fontSize: 12, color: statusColor, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            if (order != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.arrow_upward, size: 13, color: AppColors.secondary),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      order.fromAddress,
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  const Icon(Icons.arrow_downward, size: 13, color: AppColors.error),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      order.toAddress,
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 10),
            Row(
              children: [
                Text(
                  'Ваша цена: ${response.proposedPrice.toStringAsFixed(0)} ₽',
                  style: const TextStyle(
                      color: AppColors.carrier,
                      fontWeight: FontWeight.w600,
                      fontSize: 14),
                ),
                if (response.comment != null && response.comment!.isNotEmpty) ...[
                  const Spacer(),
                  const Icon(Icons.comment_outlined, size: 14, color: AppColors.textSecondary),
                ],
              ],
            ),
            if (response.comment != null && response.comment!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                response.comment!,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            if (response.status == 'selected') ...[
              const SizedBox(height: 12),
              OutlinedButton.icon(
                icon: const Icon(Icons.chat, size: 16),
                label: const Text('Открыть чат'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 44),
                  foregroundColor: AppColors.carrier,
                  side: const BorderSide(color: AppColors.carrier),
                ),
                onPressed: () => context.push(
                    '/chat/${response.orderId}/${response.carrierId}?transport=true&name=${Uri.encodeComponent('Клиент')}'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
