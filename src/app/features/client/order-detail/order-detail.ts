import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ResponseService } from '../../../core/services/response.service';
import { Order, OrderStatus, Response } from '../../../core/models/types';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink],
  templateUrl: './order-detail.html',
})
export class ClientOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private responseService = inject(ResponseService);

  readonly loading = signal(true);
  readonly order = signal<Order | null>(null);
  readonly responses = signal<Response[]>([]);
  readonly actionLoading = signal<string | null>(null);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); return; }

    const [order, responses] = await Promise.all([
      this.orderService.getOrderById(id),
      this.responseService.getResponsesByOrder(id),
    ]);
    this.order.set(order);
    this.responses.set(responses);
    this.loading.set(false);
  }

  async selectMaster(response: Response) {
    const order = this.order();
    if (!order) return;
    this.actionLoading.set(response.id);
    const ok = await this.orderService.updateOrderStatus(order.id, 'master_selected', response.master_id);
    if (ok) this.order.update(o => o ? { ...o, status: 'master_selected', selected_master_id: response.master_id } : o);
    this.actionLoading.set(null);
  }

  async complete() {
    const order = this.order();
    if (!order) return;
    this.actionLoading.set('complete');
    const ok = await this.orderService.updateOrderStatus(order.id, 'completed');
    if (ok) this.order.update(o => o ? { ...o, status: 'completed' } : o);
    this.actionLoading.set(null);
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

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }
}
