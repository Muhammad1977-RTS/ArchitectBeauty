import { Component, inject, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly role = signal<UserRole | null>(null);

  constructor() {
    effect(async () => {
      const user = this.auth.user();
      if (!user) { this.role.set(null); return; }
      const profile = await this.profileService.getProfile(user.id);
      this.role.set(profile?.role ?? null);
    }, { allowSignalWrites: true });
  }

  async logout() {
    await this.auth.signOut();
  }
}
