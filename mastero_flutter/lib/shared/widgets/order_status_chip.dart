import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class OrderStatusChip extends StatelessWidget {
  final String status;
  const OrderStatusChip({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      'new' => ('Новый', AppColors.primary),
      'master_selected' => ('Мастер выбран', AppColors.warning),
      'completed' => ('Завершён', AppColors.secondary),
      'cancelled' => ('Отменён', AppColors.error),
      _ => (status, AppColors.textSecondary),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}
