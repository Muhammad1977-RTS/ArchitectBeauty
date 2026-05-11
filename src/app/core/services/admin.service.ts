import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Profile, WorkType } from '../models/types';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private db = inject(SupabaseService).client;

  async getUsers(role?: 'client' | 'master'): Promise<Profile[]> {
    let query = this.db
      .from('profiles')
      .select('*')
      .eq('is_admin', false)
      .order('created_at', { ascending: false });
    if (role) query = query.eq('role', role);
    const { data, error } = await query;
    if (error) console.error('[admin] getUsers:', error);
    return (data as Profile[]) ?? [];
  }

  async deleteUser(userId: string): Promise<boolean> {
    const { error } = await this.db
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (error) console.error('[admin] deleteUser:', error);
    return !error;
  }

  async getWorkTypes(): Promise<WorkType[]> {
    const { data } = await this.db
      .from('work_types')
      .select('*')
      .order('name');
    return (data as WorkType[]) ?? [];
  }

  async addWorkType(name: string, slug: string): Promise<boolean> {
    const { error } = await this.db.from('work_types').insert({ name, slug });
    if (error) console.error('[admin] addWorkType:', error);
    return !error;
  }

  async deleteWorkType(id: string): Promise<boolean> {
    const { error } = await this.db.from('work_types').delete().eq('id', id);
    if (error) console.error('[admin] deleteWorkType:', error);
    return !error;
  }
}
