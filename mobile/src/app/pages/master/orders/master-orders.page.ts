import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/types';

@Component({
  selector: 'app-master-orders',
  templateUrl: './master-orders.page.html',
  styleUrls: ['./master-orders.page.scss'],
  standalone: false,
})
export class MasterOrdersPage implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(private orderService: OrderService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    this.orders = await this.orderService.getOpenOrders();
    this.loading = false;
  }

  async refresh(event: any) {
    await this.load();
    event.target.complete();
  }
}
