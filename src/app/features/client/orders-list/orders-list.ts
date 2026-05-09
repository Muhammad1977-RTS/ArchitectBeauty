import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { OrderService } from '../../../core/services/order.service';
import { ResponseService } from '../../../core/services/response.service';
import { Order, OrderStatus } from '../../../core/models/types';

type Filter = OrderStatus | 'all';

@Component({
  selector: 'app-orders-list',
  imports: [RouterLink],
  templateUrl: './orders-list.html',
})
export class ClientOrdersListComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private chatService = inject(ChatService);
  private responseService = inject(ResponseService);

  readonly loading = signal(true);
  readonly orders = signal<Order[]>([]);
  readonly filter = signal<Filter>('all');
  readonly deleting = signal<string | null>(null);
  readonly unreadCounts = signal<Map<string, number>>(new Map());
  readonly newResponseCounts = signal<Map<string, number>>(new Map());

  private responseChannel: RealtimeChannel | null = null;
  private messageChannel: RealtimeChannel | null = null;

  readonly filtered = computed(() => {
    const f = this.filter();
    if (f === 'all') return this.orders();
    return this.orders().filter(o => o.status === f);
  });

  readonly filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'new', label: 'Новые' },
    { value: 'master_selected', label: 'Мастер выбран' },
    { value: 'completed', label: 'Завершённые' },
  ];

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) return;
    const [orders, unread, newResponses] = await Promise.all([
      this.orderService.getClientOrders(user.id),
      this.chatService.getUnreadCountsForClient(user.id),
      this.responseService.getNewResponseCountsForClient(user.id),
    ]);
    this.orders.set(orders);
    this.unreadCounts.set(unread);
    this.newResponseCounts.set(newResponses);
    this.loading.set(false);

    this.responseChannel = this.responseService.subscribeToNewResponses(orderId => {
      if (this.orders().some(o => o.id === orderId)) {
        this.newResponseCounts.update(m => {
          const next = new Map(m);
          next.set(orderId, (next.get(orderId) ?? 0) + 1);
          return next;
        });
      }
    });

    this.messageChannel = this.chatService.subscribeToClientInbox(user.id, orderId => {
      if (this.orders().some(o => o.id === orderId)) {
        this.unreadCounts.update(m => {
          const next = new Map(m);
          next.set(orderId, (next.get(orderId) ?? 0) + 1);
          return next;
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.responseChannel) this.responseService.unsubscribeFromResponses(this.responseChannel);
    if (this.messageChannel) this.chatService.unsubscribe(this.messageChannel);
  }

  unreadCount(orderId: string): number {
    return this.unreadCounts().get(orderId) ?? 0;
  }

  newResponseCount(orderId: string): number {
    return this.newResponseCounts().get(orderId) ?? 0;
  }

  async deleteOrder(order: Order, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm(`Удалить заявку «${order.work_types?.name ?? 'Заявка'}»? Это действие необратимо.`)) return;

    this.deleting.set(order.id);
    const ok = await this.orderService.deleteOrder(order.id);
    this.deleting.set(null);

    if (ok) {
      this.orders.update(list => list.filter(o => o.id !== order.id));
    }
  }

  statusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      new: 'Новая',
      master_selected: 'Мастер выбран',
      completed: 'Завершена',
    };
    return map[status];
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }
}
