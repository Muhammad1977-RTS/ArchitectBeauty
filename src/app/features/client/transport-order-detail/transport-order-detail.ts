import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarrierService } from '../../../core/services/carrier.service';
import { TransportOrder, TransportResponse, VehicleType } from '../../../core/models/types';

@Component({
  selector: 'app-transport-order-detail',
  imports: [RouterLink],
  templateUrl: './transport-order-detail.html',
})
export class ClientTransportOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private carrierService = inject(CarrierService);

  readonly loading = signal(true);
  readonly order = signal<TransportOrder | null>(null);
  readonly responses = signal<TransportResponse[]>([]);
  readonly actionLoading = signal<string | null>(null);

  readonly ratingSelected = signal(0);
  readonly ratingHovered = signal(0);
  readonly reviewText = signal('');
  readonly starRange = [1, 2, 3, 4, 5];

  readonly vehicleLabels: Record<VehicleType, string> = {
    car: 'Легковая',
    minivan: 'Минивэн',
    gazelle: 'Газель',
    truck: 'Грузовик',
  };

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); return; }

    const [order, responses] = await Promise.all([
      this.carrierService.getTransportOrderById(id),
      this.carrierService.getResponsesForOrder(id),
    ]);

    this.order.set(order);
    this.responses.set(responses);
    this.loading.set(false);
  }

  async selectCarrier(response: TransportResponse) {
    const order = this.order();
    if (!order) return;
    this.actionLoading.set(response.id);
    const ok = await this.carrierService.selectCarrier(order.id, response.carrier_id);
    if (ok) {
      this.order.update(o => o ? {
        ...o, status: 'carrier_selected', selected_carrier_id: response.carrier_id,
      } : o);
      this.responses.update(list => list.map(r => ({
        ...r,
        status: r.carrier_id === response.carrier_id ? 'selected' : 'rejected',
      })));
    }
    this.actionLoading.set(null);
  }

  async complete() {
    const order = this.order();
    const rating = this.ratingSelected();
    if (!order) return;
    this.actionLoading.set('complete');
    const ok = await this.carrierService.completeTransportOrder(
      order.id,
      rating,
      this.reviewText(),
    );
    if (ok) {
      this.order.update(o => o ? {
        ...o, status: 'completed', rating, review_text: this.reviewText() || null,
      } : o);
    }
    this.actionLoading.set(null);
  }

  starActive(n: number): boolean {
    const hovered = this.ratingHovered();
    return hovered ? hovered >= n : this.ratingSelected() >= n;
  }

  vehicleLabel(type: VehicleType | null): string {
    return type ? this.vehicleLabels[type] : '';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      new: 'Новая',
      carrier_selected: 'Перевозчик выбран',
      completed: 'Завершена',
      cancelled: 'Отменена',
    };
    return map[status] ?? status;
  }

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }

  selectedResponse(): TransportResponse | null {
    const order = this.order();
    if (!order?.selected_carrier_id) return null;
    return this.responses().find(r => r.carrier_id === order.selected_carrier_id) ?? null;
  }
}
