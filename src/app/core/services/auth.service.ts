import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { UserRole } from '../models/types';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  city_district: string | null;
  is_admin: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  readonly appUser = signal<AppUser | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly user = computed(() => this.appUser());
  readonly isAuthenticated = computed(() => !!this.appUser());

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    const token = localStorage.getItem('jwt');
    const userJson = localStorage.getItem('app_user');
    if (token && userJson) {
      try {
        this.appUser.set(JSON.parse(userJson));
      } catch {
        this.clearStorage();
      }
    }
  }

  private clearStorage() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('app_user');
  }

  async signUp(email: string, password: string, role: UserRole, name = ''): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.api.post<{ token: string; user: AppUser }>('/auth/register', {
        email, password, role, name,
      });
      localStorage.setItem('jwt', res.token);
      localStorage.setItem('app_user', JSON.stringify(res.user));
      this.appUser.set(res.user);
      return true;
    } catch (e: unknown) {
      this.error.set(this.mapError(e));
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async signIn(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.api.post<{ token: string; user: AppUser }>('/auth/login', {
        email, password,
      });
      localStorage.setItem('jwt', res.token);
      localStorage.setItem('app_user', JSON.stringify(res.user));
      this.appUser.set(res.user);
      return true;
    } catch (e: unknown) {
      this.error.set(this.mapError(e));
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async signOut(): Promise<void> {
    this.clearStorage();
    this.appUser.set(null);
    await this.router.navigate(['/auth/login']);
  }

  private mapError(e: unknown): string {
    const err = e as { error?: { message?: string }; message?: string };
    const msg: string = err?.error?.message ?? err?.message ?? '';
    if (msg.includes('already registered') || msg.includes('Conflict')) return 'Пользователь с таким email уже существует';
    if (msg.includes('Invalid credentials') || msg.includes('Unauthorized')) return 'Неверный email или пароль';
    if (msg.includes('at least')) return 'Пароль должен содержать минимум 6 символов';
    return 'Произошла ошибка. Попробуйте снова.';
  }
}
