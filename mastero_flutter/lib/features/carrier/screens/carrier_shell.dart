import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CarrierShell extends StatelessWidget {
  final Widget child;
  const CarrierShell({super.key, required this.child});

  int _idx(String location) {
    if (location.startsWith('/carrier/responses')) return 1;
    if (location.startsWith('/profile')) return 2;
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
          if (i == 0) context.go('/carrier');
          if (i == 1) context.go('/carrier/responses');
          if (i == 2) context.go('/profile');
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.local_shipping), label: 'Заказы'),
          BottomNavigationBarItem(icon: Icon(Icons.reply_all), label: 'Мои отклики'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Профиль'),
        ],
      ),
    );
  }
}
