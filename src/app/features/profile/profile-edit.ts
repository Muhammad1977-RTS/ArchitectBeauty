import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { MasterRate, WorkType } from '../../core/models/types';

@Component({
  selector: 'app-profile-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-edit.html',
})
export class ProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  readonly role = signal<'client' | 'master' | null>(null);
  readonly workTypes = signal<WorkType[]>([]);
  readonly rates = signal<MasterRate[]>([]);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly rateInput = signal<Record<string, string>>({});

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    city_district: [''],
  });

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) return;

    const profile = await this.profileService.getProfile(user.id);
    if (profile) {
      this.role.set(profile.role);
      this.form.patchValue({
        name: profile.name,
        phone: profile.phone ?? '',
        city_district: profile.city_district ?? '',
      });
    }

    const workTypes = await this.profileService.getWorkTypes();
    this.workTypes.set(workTypes);

    if (profile?.role === 'master') {
      const rates = await this.profileService.getMasterRates(user.id);
      this.rates.set(rates);
      const inputMap: Record<string, string> = {};
      rates.forEach(r => {
        inputMap[r.work_type_id] = String(r.rate_per_sqm);
      });
      this.rateInput.set(inputMap);
    }
  }

  updateRate(workTypeId: string, value: string) {
    this.rateInput.update(m => ({ ...m, [workTypeId]: value }));
  }

  async save() {
    if (this.form.invalid) return;
    const user = this.auth.user();
    if (!user) return;

    this.saving.set(true);
    const { name, phone, city_district } = this.form.value;
    await this.profileService.updateProfile(user.id, {
      name: name!,
      phone: phone || null,
      city_district: city_district || null,
    });

    if (this.role() === 'master') {
      const inputs = this.rateInput();
      for (const [workTypeId, raw] of Object.entries(inputs)) {
        const val = parseFloat(raw);
        if (val > 0) {
          await this.profileService.upsertMasterRate(user.id, workTypeId, val);
        } else if (!isNaN(val) || raw === '') {
          await this.profileService.deleteMasterRate(user.id, workTypeId);
        }
      }
    }

    this.saving.set(false);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);

    const profile = await this.profileService.getProfile(user.id);
    if (profile?.name) {
      await this.router.navigate(
        profile.role === 'master' ? ['/master/orders'] : ['/client/orders']
      );
    }
  }
}
