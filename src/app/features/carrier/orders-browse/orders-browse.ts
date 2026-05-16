import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarrierService } from '../../../core/services/carrier.service';
import { TransportOrder } from '../../../core/models/types';

@Component({
  selector: 'app-carrier-orders-browse',
  imports: [RouterLink],
  templateUrl: './orders-browse.html',
})
export class CarrierOrdersBrowseComponent implements OnInit {
  private auth = inject(AuthService);
  private carrierService = inject(CarrierService);

  readonly loading = signal(true);
  readonly orders = signal<TransportOrder[]>([]);

  async ngOnInit() {
    const orders = await this.carrierService.getOpenTransportOrders();
    this.orders.set(orders);
    this.loading.set(false);
  }

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatDate2(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long',
    });
  }
}
