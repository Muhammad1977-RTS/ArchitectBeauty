import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../shared/theme/app_theme.dart';

final _complaintsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/complaints');
  return (res.data as List).cast<Map<String, dynamic>>();
});

class AdminComplaintsScreen extends ConsumerWidget {
  const AdminComplaintsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final complaintsAsync = ref.watch(_complaintsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Жалобы'),
        backgroundColor: Colors.red.shade700,
        foregroundColor: Colors.white,
      ),
      body: complaintsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (complaints) {
          if (complaints.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle_outline, size: 64, color: AppColors.secondary),
                  SizedBox(height: 12),
                  Text('Жалоб нет', style: TextStyle(color: AppColors.textSecondary)),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(_complaintsProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: complaints.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) => _ComplaintCard(
                complaint: complaints[i],
                onUpdated: () => ref.invalidate(_complaintsProvider),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ComplaintCard extends ConsumerWidget {
  final Map<String, dynamic> complaint;
  final VoidCallback onUpdated;
  const _ComplaintCard({required this.complaint, required this.onUpdated});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = complaint['status'] as String? ?? 'pending';
    final (statusLabel, statusColor) = switch (status) {
      'reviewed' => ('Рассмотрена', AppColors.secondary),
      'dismissed' => ('Отклонена', AppColors.textSecondary),
      _ => ('Ожидает', AppColors.warning),
    };

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              const Icon(Icons.report_problem, color: AppColors.error, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Жалоба на: ${(complaint['reported_user'] as Map?)?['name'] ?? complaint['reported_user_id'] ?? '—'}',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(statusLabel,
                    style: TextStyle(
                        fontSize: 11, color: statusColor, fontWeight: FontWeight.w600)),
              ),
            ]),
            const SizedBox(height: 8),
            Text(
              'Причина: ${complaint['reason'] ?? '—'}',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
            ),
            const SizedBox(height: 4),
            Text(
              'От: ${(complaint['reporter'] as Map?)?['name'] ?? '—'}',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
            ),
            if (status == 'pending') ...[
              const SizedBox(height: 12),
              Row(children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _updateStatus(context, ref, 'dismissed'),
                    style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.textSecondary,
                        side: const BorderSide(color: AppColors.border)),
                    child: const Text('Отклонить'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _updateStatus(context, ref, 'reviewed'),
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.secondary),
                    child: const Text('Рассмотрена'),
                  ),
                ),
              ]),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _updateStatus(BuildContext context, WidgetRef ref, String status) async {
    try {
      await ref.read(apiClientProvider)
          .patch('/complaints/${complaint['id']}/status', data: {'status': status});
      onUpdated();
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e'), backgroundColor: AppColors.error),
        );
      }
    }
  }
}
