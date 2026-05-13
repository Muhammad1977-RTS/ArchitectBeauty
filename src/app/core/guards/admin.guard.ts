import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.appUser();
  if (!user) { router.navigate(['/auth/login']); return false; }
  if (!user.isAdmin) { router.navigate(['/']); return false; }

  return true;
};
