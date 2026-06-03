import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MasterShell extends StatelessWidget {
  final Widget child;
  const MasterShell({super.key, required this.child});

  int _idx(String location) {
    if (location.startsWith('/master/responses')) return 1;
    if (location.startsWith('/master/transport')) return 2;
    if (location.startsWith('/profile')) return 3;
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
          if (i == 0) context.go('/master');
          if (i == 1) context.go('/master/responses');
          if (i == 2) context.go('/master/transport');
          if (i == 3) context.go('/profile');
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Заказы'),
          BottomNavigationBarItem(icon: Icon(Icons.reply_all), label: 'Отклики'),
          BottomNavigationBarItem(icon: Icon(Icons.local_shipping), label: 'Перевозка'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Профиль'),
        ],
      ),
    );
  }
}
