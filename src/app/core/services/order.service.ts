import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Order, OrderStatus, MasterStats } from '../models/types';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private db = inject(SupabaseService).client;

  async createOrder(data: {
    client_id: string;
    work_type_id: string;
    area_sqm: number;
    address: string;
    description: string;
    photo_urls: string[];
  }): Promise<Order | null> {
    const { data: order, error } = await this.db
      .from('orders')
      .insert(data)
      .select()
      .single();
    if (error) { console.error(error); return null; }
    return order as Order;
  }

  async getClientOrders(clientId: string): Promise<Order[]> {
    const { data } = await this.db
      .from('orders')
      .select('*, work_types(id, name, slug)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    return (data as Order[]) ?? [];
  }

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await this.db
      .from('orders')
      .select('*, work_types(id, name, slug)')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Order;
  }

  async getOpenOrders(): Promise<Order[]> {
    const { data } = await this.db
      .from('orders')
      .select('*, work_types(id, name, slug), profiles!client_id(name, city_district)')
      .eq('status', 'new')
      .order('created_at', { ascending: false });
    return (data as Order[]) ?? [];
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    selectedMasterId?: string
  ): Promise<boolean> {
    const updates: Partial<Order> = { status };
    if (selectedMasterId) updates.selected_master_id = selectedMasterId;
    const { error } = await this.db.from('orders').update(updates).eq('id', id);
    return !error;
  }

  async rateOrder(id: string, rating: number, reviewText?: string): Promise<boolean> {
    const { error } = await this.db
      .from('orders')
      .update({ rating, review_text: reviewText || null })
      .eq('id', id);
    return !error;
  }

  async getMasterStats(masterIds: string[]): Promise<MasterStats[]> {
    const { data } = await this.db
      .from('master_stats')
      .select('*')
      .in('master_id', masterIds);
    return (data as MasterStats[]) ?? [];
  }

  async deleteOrder(id: string): Promise<boolean> {
    const { error } = await this.db.from('orders').delete().eq('id', id);
    return !error;
  }
}
