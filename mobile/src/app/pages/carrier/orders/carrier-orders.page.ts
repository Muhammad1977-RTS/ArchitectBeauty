import { Component, OnInit } from '@angular/core';
import { CarrierService } from '../../../core/services/carrier.service';
import { TransportOrder } from '../../../core/models/types';

@Component({
  selector: 'app-carrier-orders',
  templateUrl: './carrier-orders.page.html',
  styleUrls: ['./carrier-orders.page.scss'],
  standalone: false,
})
export class CarrierOrdersPage implements OnInit {
  orders: TransportOrder[] = [];
  loading = true;

  constructor(private carrierService: CarrierService) {}

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    this.orders = await this.carrierService.getOpenTransportOrders();
    this.loading = false;
  }

  async refresh(event: any) { await this.load(); event.target.complete(); }
}
