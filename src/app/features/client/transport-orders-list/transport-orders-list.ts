import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarrierService } from '../../../core/services/carrier.service';
import { TransportOrder, TransportOrderStatus } from '../../../core/models/types';

type Filter = TransportOrderStatus | 'all';

@Component({
  selector: 'app-transport-orders-list',
  imports: [RouterLink],
  templateUrl: './transport-orders-list.html',
})
export class ClientTransportOrdersListComponent implements OnInit {
  private auth = inject(AuthService);
  private carrierService = inject(CarrierService);

  readonly loading = signal(true);
  readonly orders = signal<TransportOrder[]>([]);
  readonly filter = signal<Filter>('all');

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
    const orders = await this.carrierService.getClientTransportOrders(user.id);
    this.orders.set(orders);
    this.loading.set(false);
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

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  formatDate2(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long',
    });
  }
}
