import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/types';

@Component({
  selector: 'app-orders-browse',
  imports: [RouterLink],
  templateUrl: './orders-browse.html',
})
export class MasterOrdersBrowseComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private chatService = inject(ChatService);

  readonly loading = signal(true);
  readonly orders = signal<Order[]>([]);
  readonly unreadCounts = signal<Map<string, number>>(new Map());

  private inboxChannel: RealtimeChannel | null = null;

  async ngOnInit() {
    const user = this.auth.user();
    const [orders, unread] = await Promise.all([
      this.orderService.getOpenOrders(),
      user ? this.chatService.getUnreadCountsForMaster(user.id) : Promise.resolve(new Map()),
    ]);
    this.orders.set(orders);
    this.unreadCounts.set(unread);
    this.loading.set(false);

    if (user) {
      this.inboxChannel = this.chatService.subscribeToInbox(user.id, () => {
        this.chatService.getUnreadCountsForMaster(user.id).then(counts => {
          this.unreadCounts.set(counts);
        });
      });
    }
  }

  ngOnDestroy() {
    if (this.inboxChannel) this.chatService.unsubscribe(this.inboxChannel);
  }

  unreadCount(orderId: string): number {
    return this.unreadCounts().get(orderId) ?? 0;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }
}
