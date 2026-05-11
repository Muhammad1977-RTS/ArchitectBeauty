import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

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
  private db = inject(SupabaseService).client;

  async submit(
    reporterId: string,
    reportedUserId: string,
    reportedUserName: string,
    reason: string,
    orderId: string,
  ): Promise<boolean> {
    const { error } = await this.db.from('complaints').insert({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reported_user_name: reportedUserName,
      reason,
      order_id: orderId,
    });
    if (error) console.error('[complaint] submit:', error);
    return !error;
  }

  async getAll(): Promise<Complaint[]> {
    const { data, error } = await this.db
      .from('complaints')
      .select('*, reporter:profiles!reporter_id(name)')
      .order('created_at', { ascending: false });
    if (error) console.error('[complaint] getAll:', error);
    return (data as Complaint[]) ?? [];
  }

  async dismiss(id: string): Promise<boolean> {
    const { error } = await this.db
      .from('complaints')
      .update({ status: 'dismissed' })
      .eq('id', id);
    return !error;
  }

  async markReviewed(id: string): Promise<boolean> {
    const { error } = await this.db
      .from('complaints')
      .update({ status: 'reviewed' })
      .eq('id', id);
    return !error;
  }
}
