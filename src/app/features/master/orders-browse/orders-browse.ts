import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/types';

@Component({
  selector: 'app-orders-browse',
  imports: [RouterLink],
  templateUrl: './orders-browse.html',
})
export class MasterOrdersBrowseComponent implements OnInit {
  private orderService = inject(OrderService);

  readonly loading = signal(true);
  readonly orders = signal<Order[]>([]);

  async ngOnInit() {
    this.orders.set(await this.orderService.getOpenOrders());
    this.loading.set(false);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }
}
