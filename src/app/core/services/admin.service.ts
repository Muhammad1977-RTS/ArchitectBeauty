import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Profile, WorkType } from '../models/types';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);

  async getUsers(role?: 'client' | 'master' | 'carrier' | 'store'): Promise<Profile[]> {
    try {
      const url = role ? `/admin/users?role=${role}` : '/admin/users';
      return await this.api.get<Profile[]>(url);
    } catch {
      return [];
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      await this.api.delete(`/admin/users/${userId}`);
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

  async addWorkType(name: string, slug: string): Promise<boolean> {
    try {
      await this.api.post('/work-types', { name, slug });
      return true;
    } catch {
      return false;
    }
  }

  async deleteWorkType(id: string): Promise<boolean> {
    try {
      await this.api.delete(`/work-types/${id}`);
      return true;
    } catch {
      return false;
    }
  }
}
