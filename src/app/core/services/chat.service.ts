import { Injectable, inject, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Message } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private db = inject(SupabaseService).client;
  private readonly activeChannels = new Map<string, RealtimeChannel>();

  readonly unreadCount = signal(0);

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
    const { data, error } = await this.db
      .from('messages')
      .insert({ order_id: orderId, master_id: masterId, sender_id: senderId, content })
      .select()
      .single();
    if (error) { console.error('[chat] send:', error); return false; }

    // Broadcast for instant delivery — bypasses postgres_changes latency/RLS issues
    const channel = this.activeChannels.get(`chat:${orderId}:${masterId}`);
    channel?.send({ type: 'broadcast', event: 'new_message', payload: data });

    return true;
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

  async refreshUnreadCount(masterId: string): Promise<void> {
    const count = await this.getUnreadCount(masterId);
    this.unreadCount.set(count);
  }

  async markAsRead(orderId: string, masterId: string): Promise<void> {
    await this.db
      .from('messages')
      .update({ is_read: true })
      .eq('order_id', orderId)
      .eq('master_id', masterId)
      .neq('sender_id', masterId)
      .eq('is_read', false);
    await this.refreshUnreadCount(masterId);
  }

  subscribe(orderId: string, masterId: string, onMessage: (msg: Message) => void): RealtimeChannel {
    const key = `chat:${orderId}:${masterId}`;
    const channel = this.db
      .channel(key)
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        onMessage(payload as Message);
      })
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
    this.activeChannels.set(key, channel);
    return channel;
  }

  subscribeToClientInbox(clientId: string, onNew: (orderId: string) => void): RealtimeChannel {
    return this.db
      .channel(`client-inbox:${clientId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => {
          if (payload.new['sender_id'] !== clientId) {
            onNew(payload.new['order_id'] as string);
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
        { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => {
          if (payload.new['master_id'] === masterId && payload.new['sender_id'] !== masterId) {
            onNew();
          }
        }
      )
      .subscribe();
  }

  async getUnreadCountsForClient(clientId: string): Promise<Map<string, number>> {
    const { data, error } = await this.db
      .from('messages')
      .select('order_id')
      .eq('client_read', false)
      .neq('sender_id', clientId);
    if (error) console.error('[chat] getUnreadCountsForClient:', error);
    const counts = new Map<string, number>();
    for (const m of data ?? []) {
      const id = m.order_id as string;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }

  async getUnreadCountsForMaster(masterId: string): Promise<Map<string, number>> {
    const { data, error } = await this.db
      .from('messages')
      .select('order_id')
      .eq('master_id', masterId)
      .neq('sender_id', masterId)
      .eq('is_read', false);
    if (error) console.error('[chat] getUnreadCountsForMaster:', error);
    const counts = new Map<string, number>();
    for (const m of data ?? []) {
      const id = m.order_id as string;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }

  async markAsReadClient(orderId: string, clientId: string): Promise<void> {
    await this.db
      .from('messages')
      .update({ client_read: true })
      .eq('order_id', orderId)
      .neq('sender_id', clientId)
      .eq('client_read', false);
  }

  unsubscribe(channel: RealtimeChannel) {
    for (const [key, ch] of this.activeChannels) {
      if (ch === channel) { this.activeChannels.delete(key); break; }
    }
    this.db.removeChannel(channel);
  }
}
