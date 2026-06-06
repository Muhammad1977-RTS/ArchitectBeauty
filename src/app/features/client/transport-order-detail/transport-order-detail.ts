import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarrierService } from '../../../core/services/carrier.service';
import { TransportOrder, TransportResponse, VehicleType, TransportMessage } from '../../../core/models/types';

@Component({
  selector: 'app-transport-order-detail',
  imports: [RouterLink],
  templateUrl: './transport-order-detail.html',
})
export class ClientTransportOrderDetailComponent implements OnInit, OnDestroy {
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

  readonly chatMessages = signal<TransportMessage[]>([]);
  readonly chatDraft = signal('');
  readonly chatSending = signal(false);
  currentUserId = '';
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  readonly vehicleLabels: Record<VehicleType, string> = {
    car: 'Легковая',
    minivan: 'Минивэн',
    gazelle: 'Газель',
    truck: 'Грузовик',
  };

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.currentUserId = this.auth.user()?.id ?? '';
    if (!id) { this.loading.set(false); return; }

    const [order, responses] = await Promise.all([
      this.carrierService.getTransportOrderById(id),
      this.carrierService.getResponsesForOrder(id),
    ]);

    this.order.set(order);
    this.responses.set(responses);
    this.loading.set(false);

    this.carrierService.markTransportResponsesSeenForOrder(id);

    if (order?.selected_carrier_id) {
      await this.loadChat(order.id, order.selected_carrier_id);
    }
  }

  ngOnDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  private async loadChat(orderId: string, carrierId: string) {
    const msgs = await this.carrierService.loadMessages(orderId, carrierId);
    this.chatMessages.set(msgs);
    await this.carrierService.markMessagesRead(orderId, carrierId);
    this.scrollChat();

    this.pollTimer = setInterval(async () => {
      const fresh = await this.carrierService.loadMessages(orderId, carrierId);
      const cur = this.chatMessages();
      if (fresh.length !== cur.length || fresh[fresh.length - 1]?.id !== cur[cur.length - 1]?.id) {
        this.chatMessages.set(fresh);
        await this.carrierService.markMessagesRead(orderId, carrierId);
        this.scrollChat();
      }
    }, 3000);
  }

  private scrollChat() {
    setTimeout(() => {
      const el = document.getElementById('transport-chat');
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }

  async sendMessage() {
    const order = this.order();
    const content = this.chatDraft().trim();
    if (!order?.selected_carrier_id || !content || this.chatSending()) return;

    const tempMsg = {
      id: `tmp-${Date.now()}`,
      sender_id: this.currentUserId,
      content,
      created_at: new Date().toISOString(),
      sender: { id: this.currentUserId, name: '', role: '' },
    };
    this.chatMessages.update(m => [...m, tempMsg]);
    this.chatDraft.set('');
    this.scrollChat();

    this.chatSending.set(true);
    await this.carrierService.sendMessage(order.id, order.selected_carrier_id, content);
    this.chatSending.set(false);

    const fresh = await this.carrierService.loadMessages(order.id, order.selected_carrier_id);
    this.chatMessages.set(fresh);
    this.scrollChat();
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
      const order = this.order();
      if (order) await this.loadChat(order.id, response.carrier_id);
    }
    this.actionLoading.set(null);
  }

  async complete() {
    const order = this.order();
    if (!order) return;
    this.actionLoading.set('complete');
    const ok = await this.carrierService.completeTransportOrder(order.id);
    if (ok) {
      this.order.update(o => o ? { ...o, status: 'completed' } : o);
    }
    this.actionLoading.set(null);
  }

  async rate() {
    const order = this.order();
    const rating = this.ratingSelected();
    if (!order || !rating) return;
    this.actionLoading.set('rate');
    const ok = await this.carrierService.rateTransportOrder(order.id, rating, this.reviewText());
    if (ok) {
      this.order.update(o => o ? {
        ...o, rating, review_text: this.reviewText() || null,
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

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  selectedResponse(): TransportResponse | null {
    const order = this.order();
    if (!order?.selected_carrier_id) return null;
    return this.responses().find(r => r.carrier_id === order.selected_carrier_id) ?? null;
  }
}
