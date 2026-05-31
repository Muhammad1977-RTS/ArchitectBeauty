import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Profile, MasterRate, WorkType } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api = inject(ApiService);

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      return await this.api.get<Profile>('/profiles/me');
    } catch {
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<Pick<Profile, 'name' | 'phone' | 'city_district'>>): Promise<boolean> {
    try {
      await this.api.patch('/profiles/me', {
        name: updates.name,
        phone: updates.phone,
        cityDistrict: updates.city_district,
      });
      return true;
    } catch {
      return false;
    }
  }

  async getWorkTypes(): Promise<WorkType[]> {
    try {
      return await this.api.get<WorkType[]>('/work-types');
    } catch {
      return [];
    }
  }

  async getMasterRates(masterId: string): Promise<MasterRate[]> {
    try {
      const profile = await this.api.get<any>(`/profiles/${masterId}`);
      return profile?.master_rates ?? [];
    } catch {
      return [];
    }
  }

  async upsertMasterRate(masterId: string, workTypeId: string, ratePerSqm: number): Promise<boolean> {
    try {
      await this.api.post('/master-rates', { workTypeId, ratePerSqm });
      return true;
    } catch {
      return false;
    }
  }

  async deleteMasterRate(masterId: string, workTypeId: string): Promise<boolean> {
    try {
      await this.api.delete(`/master-rates/${workTypeId}`);
      return true;
    } catch {
      return false;
    }
  }

  async getMasterById(masterId: string): Promise<(Profile & { master_rates: MasterRate[] }) | null> {
    try {
      return await this.api.get<any>(`/profiles/${masterId}`);
    } catch {
      return null;
    }
  }
}
