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
  readonly isAdmin = computed(() => this.auth.appUser()?.is_admin ?? false);
  readonly menuOpen = signal(false);
  readonly isDark = signal(true);

  readonly isAuthPage = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects.startsWith('/auth') || e.urlAfterRedirects.startsWith('/onboarding')),
      startWith(this.router.url.startsWith('/auth') || this.router.url.startsWith('/onboarding')),
    ),
    { initialValue: false }
  );

  constructor() {
    const saved = localStorage.getItem('mastero-theme');
    const dark = saved ? saved === 'dark' : true;
    this.isDark.set(dark);
    this._applyTheme(dark);

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => this.menuOpen.set(false));
  }

  toggleTheme() {
    const newDark = !this.isDark();
    this.isDark.set(newDark);
    this._applyTheme(newDark);
    localStorage.setItem('mastero-theme', newDark ? 'dark' : 'light');
  }

  private _applyTheme(dark: boolean) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  closeMenu() { this.menuOpen.set(false); }

  async logout() {
    await this.auth.signOut();
  }
}
