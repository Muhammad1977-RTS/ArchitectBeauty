import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const profileService = inject(ProfileService);
  const router = inject(Router);

  const user = auth.user();
  if (!user) { await router.navigate(['/auth/login']); return false; }

  const profile = await profileService.getProfile(user.id);
  if (!profile?.is_admin) { await router.navigate(['/']); return false; }

  return true;
};
