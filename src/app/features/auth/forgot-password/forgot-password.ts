import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly error = signal<string | null>(null);

  async submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.api.post('/auth/forgot-password', { email: this.form.value.email });
      this.sent.set(true);
    } catch {
      this.error.set('Произошла ошибка. Попробуйте позже.');
    } finally {
      this.loading.set(false);
    }
  }
}
