import { Injectable, inject } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Message } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private db = inject(SupabaseService).client;

  async loadMessages(orderId: string, masterId: string): Promise<Message[]> {
    const { data, error } = await this.db
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .eq('master_id', masterId)
      .order('created_at', { ascending: true });
    if (error) console.error('[chat] loadMessages:', error);
    return (data as Message[]) ?? [];
  }

  async send(orderId: string, masterId: string, senderId: string, content: string): Promise<boolean> {
    const { error } = await this.db
      .from('messages')
      .insert({ order_id: orderId, master_id: masterId, sender_id: senderId, content });
    if (error) console.error('[chat] send:', error);
    return !error;
  }

  async getUnreadCount(masterId: string): Promise<number> {
    const { count } = await this.db
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('master_id', masterId)
      .neq('sender_id', masterId)
      .eq('is_read', false);
    return count ?? 0;
  }

  async markAsRead(orderId: string, masterId: string): Promise<void> {
    await this.db
      .from('messages')
      .update({ is_read: true })
      .eq('order_id', orderId)
      .eq('master_id', masterId)
      .neq('sender_id', masterId)
      .eq('is_read', false);
  }

  subscribe(orderId: string, masterId: string, onMessage: (msg: Message) => void): RealtimeChannel {
    return this.db
      .channel(`chat:${orderId}:${masterId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` },
        payload => {
          if (payload.new['master_id'] === masterId) {
            onMessage(payload.new as Message);
          }
        }
      )
      .subscribe();
  }

  subscribeToInbox(masterId: string, onNew: () => void): RealtimeChannel {
    return this.db
      .channel(`inbox:${masterId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `master_id=eq.${masterId}` },
        payload => {
          if (payload.new['sender_id'] !== masterId) onNew();
        }
      )
      .subscribe();
  }

  unsubscribe(channel: RealtimeChannel) {
    this.db.removeChannel(channel);
  }
}
