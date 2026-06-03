import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class StoreShell extends StatelessWidget {
  final Widget child;
  const StoreShell({super.key, required this.child});

  int _idx(String location) {
    if (location.startsWith('/store/profile-page')) return 1;
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
          if (i == 0) context.go('/store');
          if (i == 1) context.go('/store/profile-page');
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.inventory), label: 'Товары'),
          BottomNavigationBarItem(
              icon: Icon(Icons.storefront), label: 'Профиль'),
        ],
      ),
    );
  }
}
