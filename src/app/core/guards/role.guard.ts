import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { SupabaseService } from '../services/supabase.service';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const supabase = inject(SupabaseService).client;
  const auth = inject(AuthService);
  const profileService = inject(ProfileService);
  const router = inject(Router);

  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    await router.navigate(['/auth/login']);
    return false;
  }
  if (!auth.session()) auth.session.set(data.session);

  const requiredRole = route.data['role'] as string;
  if (!requiredRole) return true;

  const user = data.session.user;
  const profile = await profileService.getProfile(user.id);
  if (!profile || profile.role !== requiredRole) {
    const redirectMap: Record<string, string> = {
      master: '/master/orders',
      carrier: '/carrier/orders',
      client: '/client/orders',
    };
    const redirectTo = redirectMap[profile?.role ?? ''] ?? '/client/orders';
    await router.navigate([redirectTo]);
    return false;
  }

  return true;
};
