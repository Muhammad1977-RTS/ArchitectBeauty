import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/models/order.dart';
import '../../../core/providers/orders_provider.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/loading_button.dart';

class CreateOrderScreen extends ConsumerStatefulWidget {
  const CreateOrderScreen({super.key});

  @override
  ConsumerState<CreateOrderScreen> createState() => _CreateOrderScreenState();
}

class _CreateOrderScreenState extends ConsumerState<CreateOrderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _addressCtrl = TextEditingController();
  final _areaCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  WorkType? _workType;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _addressCtrl.dispose();
    _areaCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_workType == null) {
      setState(() => _error = 'Выберите вид работ');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final api = ref.read(apiClientProvider);
      await api.post('/orders', data: {
        'work_type_id': _workType!.id,
        'area_sqm': double.parse(_areaCtrl.text.trim()),
        'address': _addressCtrl.text.trim(),
        'description': _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
      });
      ref.invalidate(myOrdersProvider);
      if (mounted) context.go('/client');
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Ошибка создания заказа');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final workTypesAsync = ref.watch(workTypesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Новый заказ')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Вид работ',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
              const SizedBox(height: 8),
              workTypesAsync.when(
                loading: () => const CircularProgressIndicator(),
                error: (e, _) => Text('$e'),
                data: (types) => Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: types.map((t) {
                    final sel = _workType?.id == t.id;
                    return FilterChip(
                      label: Text(t.name),
                      selected: sel,
                      onSelected: (_) => setState(() => _workType = t),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 20),
              AppTextField(
                controller: _addressCtrl,
                label: 'Адрес',
                hint: 'ул. Пушкина, д. 1',
                validator: (v) => v == null || v.isEmpty ? 'Введите адрес' : null,
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _areaCtrl,
                label: 'Площадь (м²)',
                hint: '50',
                keyboardType: TextInputType.number,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Введите площадь';
                  if (double.tryParse(v) == null) return 'Введите число';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _descCtrl,
                label: 'Описание (необязательно)',
                hint: 'Подробнее о задаче...',
                maxLines: 4,
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 24),
              LoadingButton(
                onPressed: _submit,
                isLoading: _loading,
                label: 'Создать заказ',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
