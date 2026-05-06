import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { UserRole } from '../models/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private db = inject(SupabaseService).client;
  private router = inject(Router);

  readonly session = signal<Session | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly user = computed<User | null>(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.session());

  constructor() {
    this.db.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
    });
    this.db.auth.onAuthStateChange((_, session) => {
      this.session.set(session);
    });
  }

  async signUp(email: string, password: string, role: UserRole): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const { error } = await this.db.auth.signUp({
        email,
        password,
        options: { data: { role } },
      });
      if (error) throw error;
      return true;
    } catch (e: any) {
      console.error('[signUp error]', e);
      this.error.set(this.mapError(e.message));
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async signIn(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const { error } = await this.db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return true;
    } catch (e: any) {
      this.error.set(this.mapError(e.message));
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async signOut(): Promise<void> {
    await this.db.auth.signOut();
    await this.router.navigate(['/auth/login']);
  }

  async resetPassword(email: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const { error } = await this.db.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    } catch (e: any) {
      this.error.set(this.mapError(e.message));
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  private mapError(msg: string): string {
    if (msg.includes('Invalid login credentials')) return 'Неверный email или пароль';
    if (msg.includes('User already registered')) return 'Пользователь с таким email уже существует';
    if (msg.includes('Password should be at least')) return 'Пароль должен содержать минимум 6 символов';
    if (msg.includes('Unable to validate email')) return 'Неверный формат email';
    return 'Произошла ошибка. Попробуйте снова.';
  }
}
