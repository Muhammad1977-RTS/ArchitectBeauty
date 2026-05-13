import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { TransportOrder, TransportResponse, CarrierProfile, VehicleType } from '../models/types';

@Injectable({ providedIn: 'root' })
export class CarrierService {
  private api = inject(ApiService);

  async getOpenTransportOrders(): Promise<TransportOrder[]> {
    try {
      return await this.api.get<TransportOrder[]>('/transport-orders');
    } catch {
      return [];
    }
  }

  async getTransportOrderById(id: string): Promise<TransportOrder | null> {
    try {
      return await this.api.get<TransportOrder>(`/transport-orders/${id}`);
    } catch {
      return null;
    }
  }

  async getClientTransportOrders(_clientId: string): Promise<TransportOrder[]> {
    try {
      return await this.api.get<TransportOrder[]>('/transport-orders/my');
    } catch {
      return [];
    }
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
    try {
      return await this.api.post<TransportOrder>('/transport-orders', {
        fromAddress: payload.from_address,
        toAddress: payload.to_address,
        cargoDescription: payload.cargo_description,
        cargoWeightKg: payload.cargo_weight_kg,
        cargoVolumeM3: payload.cargo_volume_m3,
        transportDate: payload.transport_date,
        budget: payload.budget,
      });
    } catch {
      return null;
    }
  }

  async selectCarrier(orderId: string, carrierId: string): Promise<boolean> {
    try {
      await this.api.patch(`/transport-orders/${orderId}/select-carrier`, { carrierId });
      return true;
    } catch {
      return false;
    }
  }

  async completeTransportOrder(orderId: string, rating: number, reviewText: string): Promise<boolean> {
    try {
      await this.api.patch(`/transport-orders/${orderId}/complete`, { rating, reviewText });
      return true;
    } catch {
      return false;
    }
  }

  async getResponsesForOrder(orderId: string): Promise<TransportResponse[]> {
    try {
      return await this.api.get<TransportResponse[]>(`/transport-responses/by-order/${orderId}`);
    } catch {
      return [];
    }
  }

  async getMyResponseForOrder(orderId: string, carrierId: string): Promise<TransportResponse | null> {
    try {
      const all = await this.api.get<TransportResponse[]>('/transport-responses/my');
      return all.find((r: any) => r.order_id === orderId) ?? null;
    } catch {
      return null;
    }
  }

  async getMyResponses(_carrierId: string): Promise<TransportResponse[]> {
    try {
      return await this.api.get<TransportResponse[]>('/transport-responses/my');
    } catch {
      return [];
    }
  }

  async createResponse(payload: {
    order_id: string;
    carrier_id: string;
    proposed_price: number;
    comment?: string;
    vehicle_type?: VehicleType;
  }): Promise<TransportResponse | null> {
    try {
      return await this.api.post<TransportResponse>('/transport-responses', {
        orderId: payload.order_id,
        proposedPrice: payload.proposed_price,
        comment: payload.comment,
        vehicleType: payload.vehicle_type,
      });
    } catch {
      return null;
    }
  }

  async getCarrierProfile(_carrierId: string): Promise<CarrierProfile | null> {
    try {
      const profile = await this.api.get<any>('/profiles/me');
      return profile?.carrier_profile ?? null;
    } catch {
      return null;
    }
  }

  async saveCarrierProfile(profile: CarrierProfile): Promise<boolean> {
    try {
      await this.api.patch('/profiles/me/carrier-profile', {
        vehicleType: profile.vehicle_type,
        pricePerKm: profile.price_per_km,
        minPrice: profile.min_price,
        maxWeightKg: profile.max_weight_kg,
      });
      return true;
    } catch {
      return false;
    }
  }
}
