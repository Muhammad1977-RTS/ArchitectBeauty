import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { SupabaseService } from '../services/supabase.service';

export const adminGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService).client;
  const auth = inject(AuthService);
  const profileService = inject(ProfileService);
  const router = inject(Router);

  const { data } = await supabase.auth.getSession();
  if (!data.session) { await router.navigate(['/auth/login']); return false; }
  if (!auth.session()) auth.session.set(data.session);

  const profile = await profileService.getProfile(data.session.user.id);
  if (!profile?.is_admin) { await router.navigate(['/']); return false; }

  return true;
};
