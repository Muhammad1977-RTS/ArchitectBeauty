import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarrierService } from '../../../core/services/carrier.service';
import { TransportResponse } from '../../../core/models/types';

@Component({
  selector: 'app-carrier-my-responses',
  imports: [RouterLink],
  templateUrl: './my-responses.html',
})
export class CarrierMyResponsesComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private carrierService = inject(CarrierService);

  readonly loading = signal(true);
  readonly responses = signal<TransportResponse[]>([]);
  readonly filter = signal<'all' | 'active' | 'selected' | 'completed'>('all');
  readonly unreadMsgCounts = signal<Map<string, number>>(new Map());
  private badgePollTimer: ReturnType<typeof setInterval> | null = null;

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) { this.loading.set(false); return; }
    const [responses, unreadMsgs] = await Promise.all([
      this.carrierService.getMyResponses(user.id),
      this.carrierService.getUnreadMessageCounts(),
    ]);
    this.responses.set(responses);
    this.unreadMsgCounts.set(unreadMsgs);
    this.loading.set(false);

    this.badgePollTimer = setInterval(async () => {
      const fresh = await this.carrierService.getUnreadMessageCounts();
      this.unreadMsgCounts.set(fresh);
    }, 10000);
  }

  ngOnDestroy() {
    if (this.badgePollTimer) clearInterval(this.badgePollTimer);
  }

  unreadMsgCount(orderId: string): number {
    return this.unreadMsgCounts().get(orderId) ?? 0;
  }

  filtered(): TransportResponse[] {
    const f = this.filter();
    if (f === 'all') return this.responses();
    if (f === 'active') return this.responses().filter(r => r.transport_orders?.status === 'new');
    if (f === 'selected') return this.responses().filter(r => r.status === 'selected');
    if (f === 'completed') return this.responses().filter(r => r.transport_orders?.status === 'completed');
    return this.responses();
  }

  isSelected(r: TransportResponse): boolean {
    return r.status === 'selected';
  }

  statusLabel(r: TransportResponse): string {
    if (r.status === 'selected') return 'Вас выбрали';
    if (r.status === 'rejected') return 'Не выбрали';
    const orderStatus = r.transport_orders?.status;
    if (orderStatus === 'completed') return 'Завершена';
    if (orderStatus === 'cancelled') return 'Отменена';
    return 'Ожидает';
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
}
