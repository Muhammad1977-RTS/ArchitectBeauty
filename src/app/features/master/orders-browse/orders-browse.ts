import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { OrderService } from '../../../core/services/order.service';
import { Order, WorkType } from '../../../core/models/types';

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
  readonly workTypeFilter = signal<string>('');
  private badgePollTimer: ReturnType<typeof setInterval> | null = null;

  readonly availableWorkTypes = computed<WorkType[]>(() => {
    const seen = new Set<string>();
    const types: WorkType[] = [];
    for (const o of this.orders()) {
      if (o.work_type && !seen.has(o.work_type.id)) {
        seen.add(o.work_type.id);
        types.push(o.work_type);
      }
    }
    return types.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  });

  readonly filtered = computed(() => {
    const wt = this.workTypeFilter();
    if (!wt) return this.orders();
    return this.orders().filter(o => o.work_type_id === wt);
  });

  async ngOnInit() {
    const user = this.auth.user();
    const [orders, unread] = await Promise.all([
      this.orderService.getOpenOrders(),
      user ? this.chatService.getUnreadCountsForMaster(user.id) : Promise.resolve(new Map()),
    ]);
    this.orders.set(orders);
    this.unreadCounts.set(unread);
    this.loading.set(false);

    this.badgePollTimer = setInterval(async () => {
      const u = this.auth.user();
      if (!u) return;
      const freshUnread = await this.chatService.getUnreadCountsForMaster(u.id);
      this.unreadCounts.set(freshUnread);
    }, 10000);
  }

  ngOnDestroy() {
    if (this.badgePollTimer) clearInterval(this.badgePollTimer);
  }

  unreadCount(orderId: string): number {
    return this.unreadCounts().get(orderId) ?? 0;
  }

  countByType(workTypeId: string): number {
    return this.orders().filter(o => o.work_type_id === workTypeId).length;
  }

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
