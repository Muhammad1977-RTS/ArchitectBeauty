import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
})
export class NavComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly role = computed(() => this.auth.appUser()?.role ?? null);
  readonly isAdmin = computed(() => this.auth.appUser()?.isAdmin ?? false);
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
