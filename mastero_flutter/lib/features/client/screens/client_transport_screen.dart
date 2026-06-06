import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/models/transport_order.dart';
import '../../../core/providers/transport_provider.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/empty_illustration.dart';

class ClientTransportScreen extends ConsumerWidget {
  const ClientTransportScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(myTransportOrdersProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Перевозка')),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text('$e', textAlign: TextAlign.center),
              TextButton(
                onPressed: () => ref.invalidate(myTransportOrdersProvider),
                child: const Text('Повторить'),
              ),
            ],
          ),
        ),
        data: (orders) {
          if (orders.isEmpty) {
            return EmptyIllustration(
              asset: 'assets/images/empty-transport.svg',
              text: 'У вас пока нет заказов на перевозку',
              action: ElevatedButton.icon(
                icon: const Icon(Icons.add),
                label: const Text('Создать заказ'),
                onPressed: () => _showCreate(context, ref),
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(myTransportOrdersProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (ctx, i) => _TransportCard(order: orders[i], ref: ref),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreate(context, ref),
        backgroundColor: AppColors.carrier,
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showCreate(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _CreateTransportSheet(
        onCreated: () => ref.invalidate(myTransportOrdersProvider),
      ),
    );
  }
}

class _TransportCard extends StatelessWidget {
  final TransportOrder order;
  final WidgetRef ref;
  const _TransportCard({required this.order, required this.ref});

  @override
  Widget build(BuildContext context) {
    final statusColor = switch (order.status) {
      'new' => AppColors.secondary,
      'carrier_selected' => AppColors.warning,
      'completed' => AppColors.textSecondary,
      _ => AppColors.textSecondary,
    };

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => context.push('/transport/${order.id}'),
        child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.local_shipping, size: 20, color: AppColors.carrier),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    order.cargoDescription,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
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
                    style: TextStyle(fontSize: 12, color: statusColor, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _AddressRow(icon: Icons.arrow_upward, color: AppColors.secondary, text: order.fromAddress),
            const SizedBox(height: 4),
            _AddressRow(icon: Icons.arrow_downward, color: AppColors.error, text: order.toAddress),
            if (order.budget != null || order.transportDate != null) ...[
              const Divider(height: 20),
              Row(
                children: [
                  if (order.budget != null) ...[
                    const Icon(Icons.payments_outlined, size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text('${order.budget!.toStringAsFixed(0)} ₽',
                        style: const TextStyle(
                            color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 14)),
                  ],
                  if (order.budget != null && order.transportDate != null)
                    const SizedBox(width: 16),
                  if (order.transportDate != null) ...[
                    const Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(order.transportDate!,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  ],
                  if (order.cargoWeightKg != null) ...[
                    const Spacer(),
                    const Icon(Icons.scale_outlined, size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text('${order.cargoWeightKg} кг',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  ],
                ],
              ),
            ],
          ],
        ),
        ),
      ),
    );
  }
}

class _AddressRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String text;
  const _AddressRow({required this.icon, required this.color, required this.text});

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Expanded(
            child: Text(text,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ),
        ],
      );
}

class _CreateTransportSheet extends ConsumerStatefulWidget {
  final VoidCallback onCreated;
  const _CreateTransportSheet({required this.onCreated});

  @override
  ConsumerState<_CreateTransportSheet> createState() => _CreateTransportSheetState();
}

class _CreateTransportSheetState extends ConsumerState<_CreateTransportSheet> {
  final _fromCtrl = TextEditingController();
  final _toCtrl = TextEditingController();
  final _cargoCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  final _budgetCtrl = TextEditingController();
  final _dateCtrl = TextEditingController();
  bool _loading = false;

  Future<void> _submit() async {
    if (_fromCtrl.text.isEmpty || _toCtrl.text.isEmpty || _cargoCtrl.text.isEmpty) return;
    setState(() => _loading = true);
    try {
      await ref.read(apiClientProvider).post('/transport-orders', data: {
        'from_address': _fromCtrl.text.trim(),
        'to_address': _toCtrl.text.trim(),
        'cargo_description': _cargoCtrl.text.trim(),
        if (_weightCtrl.text.isNotEmpty) 'cargo_weight_kg': double.tryParse(_weightCtrl.text),
        if (_budgetCtrl.text.isNotEmpty) 'budget': double.tryParse(_budgetCtrl.text),
        if (_dateCtrl.text.isNotEmpty) 'transport_date': _dateCtrl.text.trim(),
      });
      widget.onCreated();
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('$e'), backgroundColor: AppColors.error));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Новый заказ на перевозку',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextField(
                controller: _fromCtrl,
                decoration: const InputDecoration(
                    labelText: 'Откуда *', prefixIcon: Icon(Icons.arrow_upward))),
            const SizedBox(height: 12),
            TextField(
                controller: _toCtrl,
                decoration: const InputDecoration(
                    labelText: 'Куда *', prefixIcon: Icon(Icons.arrow_downward))),
            const SizedBox(height: 12),
            TextField(
                controller: _cargoCtrl,
                maxLines: 2,
                decoration: const InputDecoration(
                    labelText: 'Описание груза *',
                    prefixIcon: Icon(Icons.inventory_2_outlined))),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(
                child: TextField(
                    controller: _weightCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Вес (кг)', suffixText: 'кг')),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                    controller: _budgetCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Бюджет (₽)', suffixText: '₽')),
              ),
            ]),
            const SizedBox(height: 12),
            TextField(
                controller: _dateCtrl,
                decoration: const InputDecoration(
                    labelText: 'Дата перевозки',
                    hintText: 'дд.мм.гггг',
                    prefixIcon: Icon(Icons.calendar_today))),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.carrier),
              child: _loading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Создать заказ'),
            ),
          ],
        ),
      ),
    );
  }
}
