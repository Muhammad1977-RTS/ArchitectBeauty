import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ClientShell extends StatelessWidget {
  final Widget child;
  const ClientShell({super.key, required this.child});

  int _idx(String location) {
    if (location.startsWith('/client/transport')) return 1;
    if (location.startsWith('/client/stores')) return 2;
    if (location == '/profile') return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _idx(location),
        onTap: (i) {
          if (i == 0) context.go('/client');
          if (i == 1) context.go('/client/transport');
          if (i == 2) context.go('/client/stores');
          if (i == 3) context.go('/profile');
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.list_alt), label: 'Заказы'),
          BottomNavigationBarItem(icon: Icon(Icons.local_shipping), label: 'Перевозка'),
          BottomNavigationBarItem(icon: Icon(Icons.store), label: 'Магазины'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Профиль'),
        ],
      ),
    );
  }
}
