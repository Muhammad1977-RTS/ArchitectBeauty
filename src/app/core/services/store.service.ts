import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Product, ProductUnit, StoreProfile } from '../models/types';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private supabase = inject(SupabaseService).client;

  async getStores(): Promise<StoreProfile[]> {
    const { data } = await this.supabase
      .from('store_profiles')
      .select('*, profiles(name, phone, city_district)')
      .order('created_at', { ascending: false });
    return (data as StoreProfile[]) ?? [];
  }

  async getStoreById(storeId: string): Promise<StoreProfile | null> {
    const { data } = await this.supabase
      .from('store_profiles')
      .select('*, profiles(name, phone, city_district)')
      .eq('store_id', storeId)
      .single();
    return data as StoreProfile | null;
  }

  async getStoreProfile(storeId: string): Promise<StoreProfile | null> {
    const { data } = await this.supabase
      .from('store_profiles')
      .select('*')
      .eq('store_id', storeId)
      .single();
    return data as StoreProfile | null;
  }

  async saveStoreProfile(storeId: string, payload: { store_name: string; address: string | null; description: string | null }): Promise<void> {
    await this.supabase
      .from('store_profiles')
      .upsert({ store_id: storeId, ...payload });
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    const { data } = await this.supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    return (data as Product[]) ?? [];
  }

  async getMyProducts(storeId: string): Promise<Product[]> {
    return this.getProductsByStore(storeId);
  }

  async createProduct(storeId: string, payload: {
    name: string;
    description: string | null;
    price: number;
    unit: ProductUnit;
    category: string | null;
    in_stock: boolean;
  }): Promise<void> {
    await this.supabase.from('products').insert({ store_id: storeId, ...payload });
  }

  async updateProduct(id: string, payload: {
    name: string;
    description: string | null;
    price: number;
    unit: ProductUnit;
    category: string | null;
    in_stock: boolean;
  }): Promise<void> {
    await this.supabase.from('products').update(payload).eq('id', id);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.supabase.from('products').delete().eq('id', id);
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    return data as Product | null;
  }
}
