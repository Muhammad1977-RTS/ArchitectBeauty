import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../api/api_client.dart';
import '../models/user.dart';
import '../services/fcm_service.dart';

const _tokenKey = 'auth_token';

class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({User? user, bool? isLoading, String? error}) => AuthState(
        user: user ?? this.user,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );

  AuthState loading() => AuthState(user: user, isLoading: true);
  AuthState withError(String e) => AuthState(user: user, error: e);
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _api;
  final FlutterSecureStorage _storage;
  final FcmService _fcm;

  AuthNotifier(this._api, this._storage, this._fcm) : super(const AuthState()) {
    _loadToken();
  }

  Future<void> _loadToken() async {
    try {
      final token = await Future.any([
        _storage.read(key: _tokenKey),
        Future.delayed(const Duration(seconds: 3), () => null),
      ]);
      if (token == null) return;
      final res = await _api.get('/profiles/me');
      state = AuthState(user: User.fromJson(res.data as Map<String, dynamic>));
      _fcm.registerToken();
    } catch (_) {}
  }

  Future<bool> login(String email, String password, {String? role}) async {
    state = state.loading();
    try {
      final res = await _api.post('/auth/login', data: {
        'email': email,
        'password': password,
        if (role != null) 'role': role,
      });
      final token = res.data['token'] as String;
      await _storage.write(key: _tokenKey, value: token);
      final profile = await _api.get('/profiles/me');
      state = AuthState(user: User.fromJson(profile.data as Map<String, dynamic>));
      _fcm.registerToken();
      return true;
    } on ApiException catch (e) {
      state = state.withError(e.message);
      return false;
    } catch (e) {
      state = state.withError('Ошибка входа');
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String name,
    required String role,
  }) async {
    state = state.loading();
    try {
      final res = await _api.post('/auth/register', data: {
        'email': email,
        'password': password,
        'name': name,
        'role': role,
      });
      final token = res.data['token'] as String;
      await _storage.write(key: _tokenKey, value: token);
      final profile = await _api.get('/profiles/me');
      state = AuthState(user: User.fromJson(profile.data as Map<String, dynamic>));
      _fcm.registerToken();
      return true;
    } on ApiException catch (e) {
      state = state.withError(e.message);
      return false;
    } catch (e) {
      state = state.withError('Ошибка регистрации');
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
    state = const AuthState();
  }

  Future<void> refreshProfile() async {
    try {
      final res = await _api.get('/profiles/me');
      state = AuthState(user: User.fromJson(res.data as Map<String, dynamic>));
    } catch (_) {}
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(apiClientProvider),
    ref.watch(secureStorageProvider),
    ref.watch(fcmServiceProvider),
  );
});

final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});
