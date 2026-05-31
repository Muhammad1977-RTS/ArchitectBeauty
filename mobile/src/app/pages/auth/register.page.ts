import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/types';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  form: FormGroup;
  loading = false;
  error = '';

  roles = [
    { value: 'client', label: 'Клиент' },
    { value: 'master', label: 'Мастер' },
    { value: 'carrier', label: 'Перевозчик' },
    { value: 'store', label: 'Строительный магазин' },
  ];

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', Validators.required],
      role: ['client', Validators.required],
    });
  }

  async submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password, name, role } = this.form.value;
    const ok = await this.auth.signUp(email, password, role as UserRole, name);
    this.loading = false;
    if (ok) {
      const map: Record<string, string> = {
        client: '/tabs/client-orders',
        master: '/tabs/master-orders',
        carrier: '/tabs/carrier-orders',
        store: '/tabs/store-products',
      };
      this.router.navigateByUrl(map[role] ?? '/tabs/profile');
    } else {
      this.error = this.auth.error() ?? 'Ошибка регистрации';
    }
  }
}
