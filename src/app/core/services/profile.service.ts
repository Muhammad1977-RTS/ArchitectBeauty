import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Profile, MasterRate, WorkType } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private db = inject(SupabaseService).client;

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as Profile;
  }

  async updateProfile(userId: string, updates: Partial<Pick<Profile, 'name' | 'phone' | 'city_district'>>): Promise<boolean> {
    const { error } = await this.db
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    return !error;
  }

  async getWorkTypes(): Promise<WorkType[]> {
    const { data } = await this.db
      .from('work_types')
      .select('*')
      .order('name');
    return (data as WorkType[]) ?? [];
  }

  async getMasterRates(masterId: string): Promise<MasterRate[]> {
    const { data } = await this.db
      .from('master_rates')
      .select('*, work_types(id, name, slug)')
      .eq('master_id', masterId);
    return (data as MasterRate[]) ?? [];
  }

  async upsertMasterRate(masterId: string, workTypeId: string, ratePerSqm: number): Promise<boolean> {
    const { error } = await this.db
      .from('master_rates')
      .upsert({ master_id: masterId, work_type_id: workTypeId, rate_per_sqm: ratePerSqm });
    return !error;
  }

  async deleteMasterRate(masterId: string, workTypeId: string): Promise<boolean> {
    const { error } = await this.db
      .from('master_rates')
      .delete()
      .eq('master_id', masterId)
      .eq('work_type_id', workTypeId);
    return !error;
  }

  async getMasterById(masterId: string): Promise<(Profile & { master_rates: MasterRate[] }) | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*, master_rates(*, work_types(id, name, slug))')
      .eq('id', masterId)
      .eq('role', 'master')
      .single();
    if (error) return null;
    return data as any;
  }
}
