import { Injectable, inject } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
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

  async getNewResponseCountsForClient(clientId: string): Promise<Map<string, number>> {
    // Fetch client's order IDs explicitly so we don't rely on RLS alone
    const { data: orders, error: ordersErr } = await this.db
      .from('orders')
      .select('id')
      .eq('client_id', clientId);
    if (ordersErr) { console.error('[responses] getNewResponseCountsForClient/orders:', ordersErr); return new Map(); }
    if (!orders?.length) return new Map();

    const orderIds = orders.map((o: { id: string }) => o.id);

    const { data, error } = await this.db
      .from('responses')
      .select('order_id')
      .in('order_id', orderIds)
      .eq('seen_by_client', false);
    if (error) console.error('[responses] getNewResponseCountsForClient/responses:', error);

    const counts = new Map<string, number>();
    for (const r of data ?? []) {
      counts.set(r.order_id, (counts.get(r.order_id) ?? 0) + 1);
    }
    return counts;
  }

  async markResponsesSeenForOrder(orderId: string): Promise<void> {
    await this.db
      .from('responses')
      .update({ seen_by_client: true })
      .eq('order_id', orderId)
      .eq('seen_by_client', false);
  }

  subscribeToNewResponses(onNew: (orderId: string) => void): RealtimeChannel {
    return this.db
      .channel('responses:new')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'responses' },
        payload => onNew(payload.new['order_id'] as string)
      )
      .subscribe();
  }

  unsubscribeFromResponses(channel: RealtimeChannel) {
    this.db.removeChannel(channel);
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
