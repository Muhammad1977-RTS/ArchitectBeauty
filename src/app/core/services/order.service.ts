import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Order, OrderStatus, MasterStats } from '../models/types';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = inject(ApiService);

  async createOrder(data: {
    client_id: string;
    work_type_id: string;
    area_sqm: number;
    address: string;
    description: string;
    photo_urls: string[];
  }): Promise<Order | null> {
    try {
      return await this.api.post<Order>('/orders', {
        workTypeId: data.work_type_id,
        areaSqm: data.area_sqm,
        address: data.address,
        description: data.description,
        photoUrls: data.photo_urls,
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getClientOrders(_clientId: string): Promise<Order[]> {
    try {
      return await this.api.get<Order[]>('/orders/my');
    } catch {
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      return await this.api.get<Order>(`/orders/${id}`);
    } catch {
      return null;
    }
  }

  async getOpenOrders(): Promise<Order[]> {
    try {
      return await this.api.get<Order[]>('/orders');
    } catch {
      return [];
    }
  }

  async updateOrderStatus(id: string, status: OrderStatus, selectedMasterId?: string): Promise<boolean> {
    try {
      if (status === 'master_selected' && selectedMasterId) {
        await this.api.patch(`/orders/${id}/select-master`, { masterId: selectedMasterId });
      }
      return true;
    } catch {
      return false;
    }
  }

  async rateOrder(id: string, rating: number, reviewText?: string): Promise<boolean> {
    try {
      await this.api.patch(`/orders/${id}/complete`, { rating, reviewText });
      return true;
    } catch {
      return false;
    }
  }

  async getMasterStats(_masterIds: string[]): Promise<MasterStats[]> {
    return [];
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      await this.api.delete(`/orders/${id}`);
      return true;
    } catch {
      return false;
    }
  }
}
