import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/user.dart';
import '../providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/client/screens/client_shell.dart';
import '../../features/client/screens/client_orders_screen.dart';
import '../../features/client/screens/client_transport_screen.dart';
import '../../features/client/screens/client_stores_screen.dart';
import '../../features/client/screens/create_order_screen.dart';
import '../../features/client/screens/order_detail_screen.dart';
import '../../features/master/screens/master_shell.dart';
import '../../features/master/screens/master_orders_screen.dart';
import '../../features/master/screens/master_responses_screen.dart';
import '../../features/carrier/screens/carrier_shell.dart';
import '../../features/carrier/screens/carrier_orders_screen.dart';
import '../../features/store/screens/store_shell.dart';
import '../../features/store/screens/store_products_screen.dart';
import '../../features/admin/screens/admin_shell.dart';
import '../../features/admin/screens/admin_users_screen.dart';
import '../../features/admin/screens/admin_complaints_screen.dart';
import '../../features/admin/screens/admin_work_types_screen.dart';
import '../../features/chat/screens/chat_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../shared/widgets/splash_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final isLoading = authState.isLoading;
      final loc = state.matchedLocation;

      if (isLoading) return null;
      if (!isAuth && (loc == '/splash' || (loc != '/login' && loc != '/register'))) {
        return '/login';
      }
      if (isAuth && (loc == '/login' || loc == '/register' || loc == '/splash')) {
        final user = authState.user!;
        return user.isAdmin ? '/admin/users' : _homeForRole(user.role);
      }
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),

      // Client routes
      ShellRoute(
        builder: (_, __, child) => ClientShell(child: child),
        routes: [
          GoRoute(path: '/client', builder: (_, __) => const ClientOrdersScreen()),
          GoRoute(
            path: '/client/orders/create',
            builder: (_, __) => const CreateOrderScreen(),
          ),
          GoRoute(
            path: '/client/orders/:id',
            builder: (_, state) => OrderDetailScreen(orderId: state.pathParameters['id']!),
          ),
          GoRoute(path: '/client/transport', builder: (_, __) => const ClientTransportScreen()),
          GoRoute(path: '/client/stores', builder: (_, __) => const ClientStoresScreen()),
        ],
      ),

      // Master routes
      ShellRoute(
        builder: (_, __, child) => MasterShell(child: child),
        routes: [
          GoRoute(path: '/master', builder: (_, __) => const MasterOrdersScreen()),
          GoRoute(path: '/master/responses', builder: (_, __) => const MasterResponsesScreen()),
        ],
      ),

      // Carrier routes
      ShellRoute(
        builder: (_, __, child) => CarrierShell(child: child),
        routes: [
          GoRoute(path: '/carrier', builder: (_, __) => const CarrierOrdersScreen()),
        ],
      ),

      // Store routes
      ShellRoute(
        builder: (_, __, child) => StoreShell(child: child),
        routes: [
          GoRoute(path: '/store', builder: (_, __) => const StoreProductsScreen()),
        ],
      ),

      // Admin routes
      ShellRoute(
        builder: (_, __, child) => AdminShell(child: child),
        routes: [
          GoRoute(path: '/admin/users', builder: (_, __) => const AdminUsersScreen()),
          GoRoute(path: '/admin/complaints', builder: (_, __) => const AdminComplaintsScreen()),
          GoRoute(path: '/admin/work-types', builder: (_, __) => const AdminWorkTypesScreen()),
        ],
      ),

      // Shared routes
      GoRoute(
        path: '/chat/:orderId/:otherId',
        builder: (_, state) => ChatScreen(
          orderId: state.pathParameters['orderId']!,
          otherId: state.pathParameters['otherId']!,
          isTransport: state.uri.queryParameters['transport'] == 'true',
        ),
      ),
      GoRoute(
        path: '/profile',
        builder: (_, __) => const ProfileScreen(),
      ),
    ],
  );
});

String _homeForRole(UserRole role) => switch (role) {
      UserRole.client => '/client',
      UserRole.master => '/master',
      UserRole.carrier => '/carrier',
      UserRole.store => '/store',
    };
