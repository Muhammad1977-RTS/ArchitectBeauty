import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../core/models/types';

@Component({
  selector: 'app-client-orders',
  templateUrl: './client-orders.page.html',
  styleUrls: ['./client-orders.page.scss'],
  standalone: false,
})
export class ClientOrdersPage implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(
    private orderService: OrderService,
    private auth: AuthService,
    private router: Router,
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    const user = this.auth.appUser();
    if (user) this.orders = await this.orderService.getClientOrders(user.id);
    this.loading = false;
  }

  async refresh(event: any) {
    await this.load();
    event.target.complete();
  }

  statusLabel(s: string) {
    const map: Record<string, string> = { new: 'Новая', master_selected: 'Мастер выбран', completed: 'Завершена' };
    return map[s] ?? s;
  }

  statusColor(s: string) {
    const map: Record<string, string> = { new: 'success', master_selected: 'warning', completed: 'tertiary' };
    return map[s] ?? 'medium';
  }
}
