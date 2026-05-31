import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CarrierService } from '../../../core/services/carrier.service';
import { AuthService } from '../../../core/services/auth.service';
import { TransportOrder, TransportResponse } from '../../../core/models/types';

@Component({
  selector: 'app-client-transport-detail',
  templateUrl: './client-transport-detail.page.html',
  styleUrls: ['./client-transport-detail.page.scss'],
  standalone: false,
})
export class ClientTransportDetailPage implements OnInit, OnDestroy {
  order: TransportOrder | null = null;
  responses: TransportResponse[] = [];
  messages: any[] = [];
  newMessage = '';
  loading = true;
  private pollInterval: any;

  statusLabels: Record<string, string> = {
    new: 'Новая', carrier_selected: 'Перевозчик выбран', completed: 'Завершена', cancelled: 'Отменена',
  };
  statusColors: Record<string, string> = {
    new: 'success', carrier_selected: 'warning', completed: 'tertiary', cancelled: 'medium',
  };

  constructor(
    private route: ActivatedRoute,
    private carrierService: CarrierService,
    public auth: AuthService,
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    await this.loadAll(id);
    this.pollInterval = setInterval(() => this.loadMessages(id), 5000);
  }

  ngOnDestroy() { clearInterval(this.pollInterval); }

  async loadAll(id: string) {
    this.loading = true;
    [this.order, this.responses] = await Promise.all([
      this.carrierService.getTransportOrderById(id),
      this.carrierService.getResponsesForOrder(id),
    ]);
    if (this.order?.selected_carrier_id) {
      await this.loadMessages(id);
    }
    this.loading = false;
  }

  async loadMessages(id: string) {
    if (!this.order?.selected_carrier_id) return;
    this.messages = await this.carrierService.loadMessages(id, this.order.selected_carrier_id);
  }

  async selectCarrier(carrierId: string) {
    if (!this.order) return;
    await this.carrierService.selectCarrier(this.order.id, carrierId);
    await this.loadAll(this.order.id);
  }

  async complete() {
    if (!this.order) return;
    await this.carrierService.rateTransportOrder(this.order.id, 5, '');
    await this.loadAll(this.order.id);
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.order?.selected_carrier_id) return;
    await this.carrierService.sendMessage(this.order.id, this.order.selected_carrier_id, this.newMessage.trim());
    this.newMessage = '';
    await this.loadMessages(this.order.id);
  }
}
