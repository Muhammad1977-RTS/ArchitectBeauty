import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Response } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ResponseService {
  private db = inject(SupabaseService).client;

  async createResponse(data: {
    order_id: string;
    master_id: string;
    proposed_price: number;
    comment: string;
    estimated_days: number | null;
  }): Promise<Response | null> {
    const { data: response, error } = await this.db
      .from('responses')
      .insert(data)
      .select()
      .single();
    if (error) { console.error(error); return null; }
    return response as Response;
  }

  async getResponsesByOrder(orderId: string): Promise<Response[]> {
    const { data } = await this.db
      .from('responses')
      .select('*, profiles(id, name, phone, city_district)')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    return (data as Response[]) ?? [];
  }

  async getMyResponses(masterId: string): Promise<Response[]> {
    const { data } = await this.db
      .from('responses')
      .select('*, orders(id, area_sqm, address, status, selected_master_id, work_types(name))')
      .eq('master_id', masterId)
      .order('created_at', { ascending: false });
    return (data as Response[]) ?? [];
  }

  async getMyResponseForOrder(orderId: string, masterId: string): Promise<Response | null> {
    const { data } = await this.db
      .from('responses')
      .select('*')
      .eq('order_id', orderId)
      .eq('master_id', masterId)
      .maybeSingle();
    return data as Response | null;
  }

  async getMasterRateForWorkType(masterId: string, workTypeId: string): Promise<number | null> {
    const { data } = await this.db
      .from('master_rates')
      .select('rate_per_sqm')
      .eq('master_id', masterId)
      .eq('work_type_id', workTypeId)
      .maybeSingle();
    return data?.rate_per_sqm ?? null;
  }
}
