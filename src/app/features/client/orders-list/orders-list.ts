import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
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

  readonly loading = signal(true);
  readonly orders = signal<Order[]>([]);
  readonly filter = signal<Filter>('all');
  readonly deleting = signal<string | null>(null);

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
    this.orders.set(await this.orderService.getClientOrders(user.id));
    this.loading.set(false);
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
