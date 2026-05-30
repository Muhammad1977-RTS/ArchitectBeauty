import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StoreService } from '../../../core/services/store.service';

@Component({
  selector: 'app-store-profile',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './store-profile.html',
})
export class StoreProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private storeService = inject(StoreService);
  private router = inject(Router);

  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly error = signal<string | null>(null);

  form = this.fb.group({
    store_name: ['', [Validators.required, Validators.minLength(2)]],
    address: [''],
    phone: [''],
    description: [''],
  });

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) return;
    const profile = await this.storeService.getStoreProfile(user.id);
    if (profile) {
      this.form.patchValue({
        store_name: profile.store_name,
        address: profile.address ?? '',
        phone: profile.store?.phone ?? '',
        description: profile.description ?? '',
      });
    }
  }

  async save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const user = this.auth.user();
    if (!user) return;

    this.saving.set(true);
    this.error.set(null);

    const { store_name, address, phone, description } = this.form.value;
    try {
      await this.storeService.saveStoreProfile(user.id, {
        store_name: store_name!,
        address: address || null,
        phone: phone || null,
        description: description || null,
      });
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2500);
    } catch {
      this.error.set('Не удалось сохранить профиль');
    } finally {
      this.saving.set(false);
    }
  }
}
