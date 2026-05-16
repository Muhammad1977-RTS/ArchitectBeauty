import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
export class ClientOrdersListComponent implements OnInit {
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
    if (!confirm(`Удалить заявку «${order.work_type?.name ?? 'Заявка'}»? Это действие необратимо.`)) return;

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

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
