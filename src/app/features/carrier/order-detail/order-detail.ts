import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarrierService } from '../../../core/services/carrier.service';
import { TransportOrder, TransportResponse, VehicleType } from '../../../core/models/types';

@Component({
  selector: 'app-carrier-order-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './order-detail.html',
})
export class CarrierOrderDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private carrierService = inject(CarrierService);
  private fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly order = signal<TransportOrder | null>(null);
  readonly myResponse = signal<TransportResponse | null>(null);
  readonly error = signal<string | null>(null);

  readonly chatMessages = signal<any[]>([]);
  readonly chatDraft = signal('');
  readonly chatSending = signal(false);
  currentUserId = '';
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  readonly vehicleTypes: { value: VehicleType; label: string }[] = [
    { value: 'car', label: 'Легковая' },
    { value: 'minivan', label: 'Минивэн' },
    { value: 'gazelle', label: 'Газель' },
    { value: 'truck', label: 'Грузовик' },
  ];

  form = this.fb.group({
    proposed_price: [null as number | null, [Validators.required, Validators.min(1)]],
    vehicle_type: ['' as VehicleType | ''],
    comment: [''],
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const user = this.auth.user();
    if (!id || !user) { this.loading.set(false); return; }

    const [order, existing, carrierProfile] = await Promise.all([
      this.carrierService.getTransportOrderById(id),
      this.carrierService.getMyResponseForOrder(id, user.id),
      this.carrierService.getCarrierProfile(user.id),
    ]);

    this.currentUserId = user.id;
    this.order.set(order);
    this.myResponse.set(existing);

    if (!existing && carrierProfile?.price_per_km) {
      this.form.patchValue({ vehicle_type: carrierProfile.vehicle_type });
    }

    this.loading.set(false);

    if (order?.selected_carrier_id === user.id) {
      await this.loadChat(order.id, user.id);
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
      const el = document.getElementById('transport-chat-carrier');
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }

  async sendMessage() {
    const order = this.order();
    const user = this.auth.user();
    const content = this.chatDraft().trim();
    if (!order?.selected_carrier_id || !user || !content || this.chatSending()) return;

    const tempMsg = {
      id: `tmp-${Date.now()}`,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
      sender: { id: user.id, name: '', role: '' },
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

  async submit() {
    if (this.form.invalid) return;
    const user = this.auth.user();
    const order = this.order();
    if (!user || !order) return;

    this.submitting.set(true);
    this.error.set(null);

    const { proposed_price, vehicle_type, comment } = this.form.value;
    const response = await this.carrierService.createResponse({
      order_id: order.id,
      carrier_id: user.id,
      proposed_price: proposed_price!,
      vehicle_type: (vehicle_type || undefined) as VehicleType | undefined,
      comment: comment || undefined,
    });

    this.submitting.set(false);

    if (response) {
      this.myResponse.set(response);
    } else {
      this.error.set('Не удалось отправить отклик. Попробуйте снова.');
    }
  }

  vehicleLabel(type: VehicleType | null): string {
    return this.vehicleTypes.find(v => v.value === type)?.label ?? '—';
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
}
