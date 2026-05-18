import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  readonly unreadCounts = signal<Map<string, number>>(new Map());
  readonly newResponseCounts = signal<Map<string, number>>(new Map());
  private badgePollTimer: ReturnType<typeof setInterval> | null = null;

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

    this.badgePollTimer = setInterval(async () => {
      const u = this.auth.user();
      if (!u) return;
      const [freshUnread, freshResponses] = await Promise.all([
        this.chatService.getUnreadCountsForClient(u.id),
        this.responseService.getNewResponseCountsForClient(u.id),
      ]);
      this.unreadCounts.set(freshUnread);
      this.newResponseCounts.set(freshResponses);
    }, 10000);
  }

  ngOnDestroy() {
    if (this.badgePollTimer) clearInterval(this.badgePollTimer);
  }

  unreadCount(orderId: string): number {
    return this.unreadCounts().get(orderId) ?? 0;
  }

  newResponseCount(orderId: string): number {
    return this.newResponseCounts().get(orderId) ?? 0;
  }

  statusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      new: 'Новая',
      master_selected: 'Мастер выбран',
      completed: 'Завершена',
    };
    return map[status];
  }

  async deleteOrder(id: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm('Удалить заявку?')) return;
    const ok = await this.orderService.deleteOrder(id);
    if (ok) this.orders.update(list => list.filter(o => o.id !== id));
  }

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
