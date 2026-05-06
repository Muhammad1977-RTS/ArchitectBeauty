import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const profileService = inject(ProfileService);
  const router = inject(Router);

  const user = auth.user();
  if (!user) {
    await router.navigate(['/auth/login']);
    return false;
  }

  const requiredRole = route.data['role'] as string;
  if (!requiredRole) return true;

  const profile = await profileService.getProfile(user.id);
  if (!profile || profile.role !== requiredRole) {
    const redirectTo = profile?.role === 'master' ? '/master/orders' : '/client/orders';
    await router.navigate([redirectTo]);
    return false;
  }

  return true;
};
