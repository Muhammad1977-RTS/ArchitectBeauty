import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/theme/app_theme.dart';

class AdminShell extends StatelessWidget {
  final Widget child;
  const AdminShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    int idx = 0;
    if (location.startsWith('/admin/complaints')) idx = 1;
    if (location.startsWith('/admin/work-types')) idx = 2;
    if (location.startsWith('/profile')) idx = 3;

    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: idx,
        selectedItemColor: Colors.red.shade700,
        onTap: (i) {
          if (i == 0) context.go('/admin/users');
          if (i == 1) context.go('/admin/complaints');
          if (i == 2) context.go('/admin/work-types');
          if (i == 3) context.go('/profile');
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Пользователи'),
          BottomNavigationBarItem(icon: Icon(Icons.report), label: 'Жалобы'),
          BottomNavigationBarItem(icon: Icon(Icons.build_circle), label: 'Виды работ'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Профиль'),
        ],
      ),
    );
  }
}
