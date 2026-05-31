import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.appUser();
  if (!user) { router.navigate(['/auth/login']); return false; }

  const requiredRole = route.data['role'] as string;
  if (!requiredRole) return true;

  if (user.role !== requiredRole) {
    const redirectMap: Record<string, string> = {
      master: '/master/orders',
      carrier: '/carrier/orders',
      client: '/client/orders',
      store: '/store/products',
    };
    router.navigate([redirectMap[user.role] ?? '/client/orders']);
    return false;
  }

  return true;
};
