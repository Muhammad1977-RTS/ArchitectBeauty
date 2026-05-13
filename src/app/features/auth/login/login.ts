import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = this.auth.loading;
  readonly error = this.auth.error;
  readonly showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    const ok = await this.auth.signIn(email!, password!);
    if (ok) {
      const user = this.auth.appUser();
      if (!user) return;
      const routes: Record<string, string> = {
        master: '/master/orders',
        carrier: '/carrier/orders',
        client: '/client/orders',
        store: '/store/products',
      };
      await this.router.navigate([routes[user.role] ?? '/client/orders']);
    }
  }
}
