import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface Complaint {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reported_user_name: string;
  reason: string;
  order_id: string | null;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
  reporter?: { name: string };
}

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private api = inject(ApiService);

  async submit(
    reporterId: string,
    reportedUserId: string,
    _reportedUserName: string,
    reason: string,
    _orderId: string,
  ): Promise<boolean> {
    try {
      await this.api.post('/complaints', { reportedUserId, reason });
      return true;
    } catch (e) {
      console.error('[complaint] submit:', e);
      return false;
    }
  }

  async getAll(): Promise<Complaint[]> {
    try {
      return await this.api.get<Complaint[]>('/complaints');
    } catch {
      return [];
    }
  }

  async dismiss(id: string): Promise<boolean> {
    try {
      await this.api.patch(`/complaints/${id}/status`, { status: 'dismissed' });
      return true;
    } catch {
      return false;
    }
  }

  async markReviewed(id: string): Promise<boolean> {
    try {
      await this.api.patch(`/complaints/${id}/status`, { status: 'reviewed' });
      return true;
    } catch {
      return false;
    }
  }
}
