import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Message } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = inject(ApiService);

  async loadMessages(orderId: string, _masterId: string): Promise<Message[]> {
    try {
      return await this.api.get<Message[]>(`/messages/order/${orderId}`);
    } catch {
      return [];
    }
  }

  async send(orderId: string, _masterId: string, _senderId: string, content: string): Promise<boolean> {
    try {
      await this.api.post(`/messages/order/${orderId}`, { content });
      return true;
    } catch {
      return false;
    }
  }

  async markAsRead(orderId: string, _masterId: string): Promise<void> {
    try {
      await this.api.post(`/messages/order/${orderId}/read`, {});
    } catch {}
  }

  async markAsReadClient(orderId: string, _clientId: string): Promise<void> {
    try {
      await this.api.post(`/messages/order/${orderId}/read`, {});
    } catch {}
  }

  async getUnreadCountsForClient(_clientId: string): Promise<Map<string, number>> {
    try {
      const counts = await this.api.get<Record<string, number>>('/messages/unread');
      return new Map(Object.entries(counts));
    } catch {
      return new Map();
    }
  }

  async getUnreadCountsForMaster(_masterId: string): Promise<Map<string, number>> {
    return this.getUnreadCountsForClient(_masterId);
  }

  subscribe(_orderId: string, _masterId: string, _onMessage: (msg: Message) => void): null {
    return null;
  }

  subscribeToInbox(_masterId: string, _onNew: (orderId: string) => void): null {
    return null;
  }

  subscribeToClientInbox(_clientId: string, _onNew: (orderId: string) => void): null {
    return null;
  }

  subscribeForBadge(_orderId: string, _masterId: string, _onClientMessage: () => void): null {
    return null;
  }

  unsubscribe(_channel: any) {}
}
