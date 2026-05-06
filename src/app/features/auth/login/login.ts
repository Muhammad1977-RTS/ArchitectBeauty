import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  readonly loading = this.auth.loading;
  readonly error = this.auth.error;
  readonly resetSent = signal(false);
  readonly showReset = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async submit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    const ok = await this.auth.signIn(email!, password!);
    if (ok) {
      const user = this.auth.user();
      if (user) {
        const profile = await this.profileService.getProfile(user.id);
        if (!profile?.name) {
          await this.router.navigate(['/profile']);
        } else {
          await this.router.navigate(
            profile.role === 'master' ? ['/master/orders'] : ['/client/orders']
          );
        }
      }
    }
  }

  async sendReset() {
    if (this.resetForm.invalid) return;
    const ok = await this.auth.resetPassword(this.resetForm.value.email!);
    if (ok) this.resetSent.set(true);
  }
}
