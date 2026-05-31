import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    const ok = await this.auth.signIn(email, password);
    this.loading = false;
    if (ok) {
      const role = this.auth.appUser()?.role;
      const map: Record<string, string> = {
        client: '/tabs/client-orders',
        master: '/tabs/master-orders',
        carrier: '/tabs/carrier-orders',
        store: '/tabs/store-products',
      };
      this.router.navigateByUrl(map[role ?? 'client'] ?? '/tabs/profile');
    } else {
      this.error = this.auth.error() ?? 'Ошибка входа';
    }
  }
}
