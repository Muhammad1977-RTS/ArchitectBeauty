import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { UserRole } from '../../core/models/types';

@Component({
  selector: 'app-onboarding',
  imports: [ReactiveFormsModule],
  templateUrl: './onboarding.html',
})
export class OnboardingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private profile = inject(ProfileService);
  private router = inject(Router);

  readonly step = signal(1);
  readonly saving = signal(false);
  readonly role = signal<UserRole | null>(null);

  readonly totalSteps = computed(() => this.role() === 'master' ? 3 : 3);

  readonly stepOneForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
  });

  readonly stepTwoForm = this.fb.group({
    city_district: [''],
  });

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) { await this.router.navigate(['/auth/login']); return; }

    this.role.set((this.auth.appUser()?.role as UserRole) ?? 'client');

    const existing = await this.profile.getProfile(user.id);
    if (existing?.name) {
      this.stepOneForm.patchValue({ name: existing.name, phone: existing.phone ?? '' });
    }
    if (existing?.city_district) {
      this.stepTwoForm.patchValue({ city_district: existing.city_district });
    }
  }

  async nextStep() {
    if (this.step() === 1) {
      this.stepOneForm.markAllAsTouched();
      if (this.stepOneForm.invalid) return;
    }

    if (this.step() === 2) {
      await this.saveProfile();
      if (this.role() === 'master') {
        this.step.set(3);
        return;
      }
      this.step.set(3);
      return;
    }

    this.step.update(s => s + 1);
  }

  prevStep() {
    this.step.update(s => Math.max(1, s - 1));
  }

  private async saveProfile() {
    const user = this.auth.user();
    if (!user) return;

    this.saving.set(true);
    const { name, phone } = this.stepOneForm.value;
    const { city_district } = this.stepTwoForm.value;

    await this.profile.updateProfile(user.id, {
      name: name!,
      phone: phone || null,
      city_district: city_district || null,
    });
    this.saving.set(false);
  }

  async finish() {
    await this.saveProfile();
    const role = this.role();
    await this.router.navigate(role === 'master' ? ['/master/orders'] : ['/client/orders']);
  }

  async goCreateOrder() {
    await this.saveProfile();
    await this.router.navigate(['/client/orders/new']);
  }
}
