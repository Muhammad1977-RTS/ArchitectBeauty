import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../models/order.dart';

final workTypesProvider = FutureProvider<List<WorkType>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/work-types');
  return (res.data as List).map((j) => WorkType.fromJson(j as Map<String, dynamic>)).toList();
});

final myOrdersProvider = FutureProvider<List<Order>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/orders/my');
  return (res.data as List).map((j) => Order.fromJson(j as Map<String, dynamic>)).toList();
});

final allOrdersProvider = FutureProvider<List<Order>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/orders');
  return (res.data as List).map((j) => Order.fromJson(j as Map<String, dynamic>)).toList();
});

final orderDetailProvider = FutureProvider.family<Order, String>((ref, id) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/orders/$id');
  return Order.fromJson(res.data as Map<String, dynamic>);
});

final orderResponsesProvider = FutureProvider.family<List<OrderResponse>, String>((ref, orderId) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/responses/by-order/$orderId');
  return (res.data as List).map((j) => OrderResponse.fromJson(j as Map<String, dynamic>)).toList();
});

final myResponsesProvider = FutureProvider<List<OrderResponse>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/responses/my');
  return (res.data as List).map((j) => OrderResponse.fromJson(j as Map<String, dynamic>)).toList();
});
