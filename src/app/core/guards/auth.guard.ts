import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService).client;
  const auth = inject(AuthService);
  const router = inject(Router);

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    auth.session.set(data.session);
    return true;
  }

  await router.navigate(['/auth/login']);
  return false;
};
