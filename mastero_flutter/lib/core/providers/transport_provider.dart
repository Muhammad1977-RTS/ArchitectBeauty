import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../models/transport_order.dart';

final myTransportOrdersProvider = FutureProvider<List<TransportOrder>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/transport-orders/my');
  return (res.data as List).map((j) => TransportOrder.fromJson(j as Map<String, dynamic>)).toList();
});

final allTransportOrdersProvider = FutureProvider<List<TransportOrder>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/transport-orders');
  return (res.data as List).map((j) => TransportOrder.fromJson(j as Map<String, dynamic>)).toList();
});

final transportOrderDetailProvider = FutureProvider.family<TransportOrder, String>((ref, id) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/transport-orders/$id');
  return TransportOrder.fromJson(res.data as Map<String, dynamic>);
});

final transportResponsesProvider = FutureProvider.family<List<TransportResponse>, String>((ref, orderId) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/transport-responses/by-order/$orderId');
  return (res.data as List).map((j) => TransportResponse.fromJson(j as Map<String, dynamic>)).toList();
});

final myTransportResponsesProvider = FutureProvider<List<TransportResponse>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/transport-responses/my');
  return (res.data as List).map((j) => TransportResponse.fromJson(j as Map<String, dynamic>)).toList();
});
