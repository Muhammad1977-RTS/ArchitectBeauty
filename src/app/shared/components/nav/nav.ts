import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
})
export class NavComponent {
  readonly auth = inject(AuthService);
  private profileService = inject(ProfileService);

  readonly user = this.auth.user;
  readonly isAuthenticated = this.auth.isAuthenticated;

  async logout() {
    await this.auth.signOut();
  }
}
