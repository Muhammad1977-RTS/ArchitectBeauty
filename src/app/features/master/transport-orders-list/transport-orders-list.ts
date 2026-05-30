import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarrierService } from '../../../core/services/carrier.service';
import { TransportOrder, TransportOrderStatus } from '../../../core/models/types';

type Filter = TransportOrderStatus | 'all';

@Component({
  selector: 'app-master-transport-orders-list',
  imports: [RouterLink],
  templateUrl: './transport-orders-list.html',
})
export class MasterTransportOrdersListComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private carrierService = inject(CarrierService);

  readonly loading = signal(true);
  readonly orders = signal<TransportOrder[]>([]);
  readonly filter = signal<Filter>('all');
  readonly newResponseCounts = signal<Map<string, number>>(new Map());
  readonly unreadMsgCounts = signal<Map<string, number>>(new Map());
  private badgePollTimer: ReturnType<typeof setInterval> | null = null;

  readonly filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'new', label: 'Новые' },
    { value: 'carrier_selected', label: 'Перевозчик выбран' },
    { value: 'completed', label: 'Завершённые' },
  ];

  readonly filtered = computed(() => {
    const f = this.filter();
    if (f === 'all') return this.orders();
    return this.orders().filter(o => o.status === f);
  });

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) { this.loading.set(false); return; }
    const [orders, newResponses, unreadMsgs] = await Promise.all([
      this.carrierService.getClientTransportOrders(user.id),
      this.carrierService.getNewResponseCountsForTransport(),
      this.carrierService.getUnreadMessageCounts(),
    ]);
    this.orders.set(orders);
    this.newResponseCounts.set(newResponses);
    this.unreadMsgCounts.set(unreadMsgs);
    this.loading.set(false);

    this.badgePollTimer = setInterval(async () => {
      const [freshResponses, freshMsgs] = await Promise.all([
        this.carrierService.getNewResponseCountsForTransport(),
        this.carrierService.getUnreadMessageCounts(),
      ]);
      this.newResponseCounts.set(freshResponses);
      this.unreadMsgCounts.set(freshMsgs);
    }, 10000);
  }

  ngOnDestroy() {
    if (this.badgePollTimer) clearInterval(this.badgePollTimer);
  }

  newResponseCount(orderId: string): number {
    return this.newResponseCounts().get(orderId) ?? 0;
  }

  unreadMsgCount(orderId: string): number {
    return this.unreadMsgCounts().get(orderId) ?? 0;
  }

  statusLabel(status: TransportOrderStatus): string {
    const map: Record<TransportOrderStatus, string> = {
      new: 'Новая',
      carrier_selected: 'Перевозчик выбран',
      completed: 'Завершена',
      cancelled: 'Отменена',
    };
    return map[status];
  }

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatDate2(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  }
}
