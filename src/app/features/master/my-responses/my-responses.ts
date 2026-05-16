import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { ResponseService } from '../../../core/services/response.service';
import { Response } from '../../../core/models/types';

@Component({
  selector: 'app-my-responses',
  imports: [RouterLink],
  templateUrl: './my-responses.html',
})
export class MasterMyResponsesComponent implements OnInit {
  private auth = inject(AuthService);
  private responseService = inject(ResponseService);
  private chatService = inject(ChatService);

  readonly loading = signal(true);
  readonly responses = signal<Response[]>([]);
  readonly unreadCounts = signal<Map<string, number>>(new Map());
  readonly filter = signal<'all' | 'active' | 'selected' | 'completed'>('all');

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

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
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
