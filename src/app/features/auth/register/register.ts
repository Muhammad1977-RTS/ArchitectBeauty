import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/types';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = this.auth.loading;
  readonly error = this.auth.error;
  readonly selectedRole = signal<UserRole | null>(null);
  readonly showPassword = signal(false);
  readonly showPasswordConfirm = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirm: ['', Validators.required],
  });

  selectRole(role: UserRole) {
    this.selectedRole.set(role);
  }

  async submit() {
    if (this.form.invalid || !this.selectedRole()) return;
    const { name, email, password, passwordConfirm } = this.form.value;
    if (password !== passwordConfirm) {
      this.auth.error.set('Пароли не совпадают');
      return;
    }
    const ok = await this.auth.signUp(email!, password!, this.selectedRole()!, name!);
    if (ok) await this.router.navigate(['/onboarding']);
  }
}
