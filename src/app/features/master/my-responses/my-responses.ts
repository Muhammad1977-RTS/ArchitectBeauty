import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { ResponseService } from '../../../core/services/response.service';
import { Response } from '../../../core/models/types';

@Component({
  selector: 'app-my-responses',
  imports: [RouterLink],
  templateUrl: './my-responses.html',
})
export class MasterMyResponsesComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private responseService = inject(ResponseService);
  private chatService = inject(ChatService);

  readonly loading = signal(true);
  readonly responses = signal<Response[]>([]);
  readonly unreadCounts = signal<Map<string, number>>(new Map());
  readonly filter = signal<'all' | 'active' | 'selected' | 'completed'>('all');

  private channels: RealtimeChannel[] = [];

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) { this.loading.set(false); return; }
    const [responses, unread] = await Promise.all([
      this.responseService.getMyResponses(user.id),
      this.chatService.getUnreadCountsForMaster(user.id),
    ]);
    this.responses.set(responses);
    this.unreadCounts.set(unread);
    this.loading.set(false);

    for (const r of responses) {
      const orderId = r.order_id;
      const ch = this.chatService.subscribeForBadge(orderId, user.id, () => {
        this.unreadCounts.update(m => {
          const next = new Map(m);
          next.set(orderId, (next.get(orderId) ?? 0) + 1);
          return next;
        });
      });
      this.channels.push(ch);
    }
  }

  ngOnDestroy() {
    for (const ch of this.channels) this.chatService.unsubscribe(ch);
  }

  unreadCount(orderId: string): number {
    return this.unreadCounts().get(orderId) ?? 0;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      new: 'Новая',
      master_selected: 'Мастер выбран',
      completed: 'Завершена',
    };
    return map[status] ?? status;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }

  isSelected(r: Response): boolean {
    return r.orders?.status === 'master_selected' && r.orders?.selected_master_id === r.master_id;
  }

  filtered(): Response[] {
    const f = this.filter();
    if (f === 'all') return this.responses();
    if (f === 'active') return this.responses().filter(r => r.orders?.status === 'new');
    if (f === 'selected') return this.responses().filter(r => this.isSelected(r));
    if (f === 'completed') return this.responses().filter(r => r.orders?.status === 'completed');
    return this.responses();
  }
}
