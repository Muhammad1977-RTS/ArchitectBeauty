import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Product, ProductUnit, StoreProfile } from '../models/types';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private api = inject(ApiService);

  async getStores(): Promise<StoreProfile[]> {
    try {
      return await this.api.get<StoreProfile[]>('/store');
    } catch {
      return [];
    }
  }

  async getStoreById(storeId: string): Promise<StoreProfile | null> {
    try {
      return await this.api.get<StoreProfile>(`/store/${storeId}`);
    } catch {
      return null;
    }
  }

  async getStoreProfile(_storeId: string): Promise<StoreProfile | null> {
    try {
      return await this.api.get<StoreProfile>('/store/my');
    } catch {
      return null;
    }
  }

  async saveStoreProfile(_storeId: string, payload: { store_name: string; address: string | null; description: string | null; phone: string | null }): Promise<void> {
    try {
      await this.api.put('/store/my', {
        storeName: payload.store_name,
        address: payload.address,
        description: payload.description,
        phone: payload.phone,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    try {
      return await this.api.get<Product[]>(`/products/by-store/${storeId}`);
    } catch {
      return [];
    }
  }

  async getMyProducts(_storeId: string): Promise<Product[]> {
    try {
      return await this.api.get<Product[]>('/products/my');
    } catch {
      return [];
    }
  }

  async createProduct(_storeId: string, payload: {
    name: string;
    description: string | null;
    price: number;
    unit: ProductUnit;
    category: string | null;
    in_stock: boolean;
  }): Promise<void> {
    try {
      await this.api.post('/products', {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        unit: payload.unit,
        category: payload.category,
        inStock: payload.in_stock,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async updateProduct(id: string, payload: {
    name: string;
    description: string | null;
    price: number;
    unit: ProductUnit;
    category: string | null;
    in_stock: boolean;
  }): Promise<void> {
    try {
      await this.api.put(`/products/${id}`, {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        unit: payload.unit,
        category: payload.category,
        inStock: payload.in_stock,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.api.delete(`/products/${id}`);
    } catch (e) {
      console.error(e);
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await this.api.get<Product>(`/products/${id}`);
    } catch {
      return null;
    }
  }
}
