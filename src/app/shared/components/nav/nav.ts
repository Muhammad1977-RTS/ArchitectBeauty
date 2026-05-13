import { Component, inject, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { UserRole } from '../../../core/models/types';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
})
export class NavComponent {
  readonly auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly role = signal<UserRole | null>(null);
  readonly isAdmin = signal(false);
  readonly menuOpen = signal(false);

  readonly isAuthPage = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects.startsWith('/auth') || e.urlAfterRedirects.startsWith('/onboarding')),
      startWith(this.router.url.startsWith('/auth') || this.router.url.startsWith('/onboarding')),
    ),
    { initialValue: false }
  );

  constructor() {
    effect(async () => {
      const user = this.auth.user();
      if (!user) { this.role.set(null); this.isAdmin.set(false); return; }
      const profile = await this.profileService.getProfile(user.id);
      this.role.set(profile?.role ?? null);
      this.isAdmin.set(profile?.is_admin ?? false);
    }, { allowSignalWrites: true });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => this.menuOpen.set(false));
  }

  closeMenu() { this.menuOpen.set(false); }

  async logout() {
    await this.auth.signOut();
  }
}
