import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
  TransportOrder,
  TransportResponse,
  CarrierProfile,
  VehicleType,
} from '../models/types';

@Injectable({ providedIn: 'root' })
export class CarrierService {
  private supabase = inject(SupabaseService).client;

  // ── Транспортные заявки ──────────────────────────────────────────────

  async getOpenTransportOrders(): Promise<TransportOrder[]> {
    const { data } = await this.supabase
      .from('transport_orders')
      .select('*, profiles(id, name, phone, city_district, role, is_admin, created_at)')
      .eq('status', 'new')
      .order('created_at', { ascending: false });
    return (data as TransportOrder[]) ?? [];
  }

  async getTransportOrderById(id: string): Promise<TransportOrder | null> {
    const { data } = await this.supabase
      .from('transport_orders')
      .select('*, profiles(id, name, phone, city_district, role, is_admin, created_at)')
      .eq('id', id)
      .single();
    return (data as TransportOrder) ?? null;
  }

  async getClientTransportOrders(clientId: string): Promise<TransportOrder[]> {
    const { data } = await this.supabase
      .from('transport_orders')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    return (data as TransportOrder[]) ?? [];
  }

  async createTransportOrder(payload: {
    client_id: string;
    from_address: string;
    to_address: string;
    cargo_description: string;
    cargo_weight_kg?: number | null;
    cargo_volume_m3?: number | null;
    transport_date?: string | null;
    budget?: number | null;
  }): Promise<TransportOrder | null> {
    const { data } = await this.supabase
      .from('transport_orders')
      .insert(payload)
      .select()
      .single();
    return (data as TransportOrder) ?? null;
  }

  async selectCarrier(orderId: string, carrierId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('transport_orders')
      .update({ status: 'carrier_selected', selected_carrier_id: carrierId })
      .eq('id', orderId);
    if (error) return false;

    await this.supabase
      .from('transport_responses')
      .update({ status: 'selected' })
      .eq('order_id', orderId)
      .eq('carrier_id', carrierId);

    await this.supabase
      .from('transport_responses')
      .update({ status: 'rejected' })
      .eq('order_id', orderId)
      .neq('carrier_id', carrierId);

    return true;
  }

  async completeTransportOrder(
    orderId: string,
    rating: number,
    reviewText: string,
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from('transport_orders')
      .update({ status: 'completed', rating, review_text: reviewText })
      .eq('id', orderId);
    return !error;
  }

  // ── Отклики перевозчиков ─────────────────────────────────────────────

  async getResponsesForOrder(orderId: string): Promise<TransportResponse[]> {
    const { data } = await this.supabase
      .from('transport_responses')
      .select('*, profiles(id, name, phone, city_district, role, is_admin, created_at)')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    return (data as TransportResponse[]) ?? [];
  }

  async getMyResponseForOrder(
    orderId: string,
    carrierId: string,
  ): Promise<TransportResponse | null> {
    const { data } = await this.supabase
      .from('transport_responses')
      .select('*')
      .eq('order_id', orderId)
      .eq('carrier_id', carrierId)
      .maybeSingle();
    return (data as TransportResponse) ?? null;
  }

  async getMyResponses(carrierId: string): Promise<TransportResponse[]> {
    const { data } = await this.supabase
      .from('transport_responses')
      .select(
        '*, transport_orders(id, from_address, to_address, status, selected_carrier_id)',
      )
      .eq('carrier_id', carrierId)
      .order('created_at', { ascending: false });
    return (data as TransportResponse[]) ?? [];
  }

  async createResponse(payload: {
    order_id: string;
    carrier_id: string;
    proposed_price: number;
    comment?: string;
    vehicle_type?: VehicleType;
  }): Promise<TransportResponse | null> {
    const { data } = await this.supabase
      .from('transport_responses')
      .insert(payload)
      .select()
      .single();
    return (data as TransportResponse) ?? null;
  }

  // ── Профиль перевозчика (ставки) ─────────────────────────────────────

  async getCarrierProfile(carrierId: string): Promise<CarrierProfile | null> {
    const { data } = await this.supabase
      .from('carrier_profiles')
      .select('*')
      .eq('carrier_id', carrierId)
      .maybeSingle();
    return (data as CarrierProfile) ?? null;
  }

  async saveCarrierProfile(profile: CarrierProfile): Promise<boolean> {
    const { error } = await this.supabase
      .from('carrier_profiles')
      .upsert({ ...profile, updated_at: new Date().toISOString() });
    return !error;
  }
}
