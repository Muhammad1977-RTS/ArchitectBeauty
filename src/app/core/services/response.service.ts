import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Response } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ResponseService {
  private api = inject(ApiService);

  async createResponse(data: {
    order_id: string;
    master_id: string;
    proposed_price: number;
    comment: string;
    estimated_days: number | null;
  }): Promise<Response | null> {
    try {
      return await this.api.post<Response>('/responses', {
        orderId: data.order_id,
        proposedPrice: data.proposed_price,
        comment: data.comment,
        estimatedDays: data.estimated_days,
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getResponsesByOrder(orderId: string): Promise<Response[]> {
    try {
      return await this.api.get<Response[]>(`/responses/by-order/${orderId}`);
    } catch {
      return [];
    }
  }

  async getMyResponses(masterId: string): Promise<Response[]> {
    try {
      return await this.api.get<Response[]>('/responses/my');
    } catch {
      return [];
    }
  }

  async getMyResponseForOrder(orderId: string, masterId: string): Promise<Response | null> {
    try {
      const all = await this.api.get<Response[]>(`/responses/by-order/${orderId}`);
      return all.find((r: any) => r.master_id === masterId) ?? null;
    } catch {
      return null;
    }
  }

  async getNewResponseCountsForClient(_clientId: string): Promise<Map<string, number>> {
    try {
      const counts = await this.api.get<Record<string, number>>('/responses/unseen-counts');
      return new Map(Object.entries(counts));
    } catch {
      return new Map();
    }
  }

  async markResponsesSeenForOrder(orderId: string): Promise<void> {
    try {
      await this.api.post(`/responses/order/${orderId}/seen`, {});
    } catch {}
  }

  subscribeToNewResponses(_onNew: (orderId: string) => void): null {
    return null;
  }

  unsubscribeFromResponses(_channel: any) {}

  async getMasterRateForWorkType(masterId: string, workTypeId: string): Promise<number | null> {
    try {
      const profile = await this.api.get<any>(`/profiles/${masterId}`);
      const rate = profile?.master_rates?.find((r: any) => r.work_type_id === workTypeId);
      return rate?.rate_per_sqm ?? null;
    } catch {
      return null;
    }
  }
}
