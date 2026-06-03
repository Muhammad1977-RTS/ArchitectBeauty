import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MasterShell extends StatelessWidget {
  final Widget child;
  const MasterShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    int idx = 0;
    if (location.startsWith('/master/responses')) idx = 1;
    if (location.startsWith('/profile')) idx = 2;

    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: idx,
        onTap: (i) {
          if (i == 0) context.go('/master');
          if (i == 1) context.go('/master/responses');
          if (i == 2) context.go('/profile');
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Заказы'),
          BottomNavigationBarItem(icon: Icon(Icons.reply_all), label: 'Мои отклики'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Профиль'),
        ],
      ),
    );
  }
}
