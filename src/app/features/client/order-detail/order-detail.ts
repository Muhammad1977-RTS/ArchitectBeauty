import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/types';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink],
  templateUrl: './order-detail.html',
})
export class ClientOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  readonly loading = signal(true);
  readonly order = signal<Order | null>(null);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.order.set(await this.orderService.getOrderById(id));
    this.loading.set(false);
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
