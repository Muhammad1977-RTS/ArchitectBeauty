import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { ComplaintService } from '../../../core/services/complaint.service';
import { OrderService } from '../../../core/services/order.service';
import { ResponseService } from '../../../core/services/response.service';
import { Order, OrderStatus, Response, MasterStats, Message } from '../../../core/models/types';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink],
  templateUrl: './order-detail.html',
})
export class ClientOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private responseService = inject(ResponseService);
  private chatService = inject(ChatService);
  private complaintService = inject(ComplaintService);

  readonly loading = signal(true);
  readonly order = signal<Order | null>(null);
  readonly responses = signal<Response[]>([]);
  readonly actionLoading = signal<string | null>(null);
  readonly masterStats = signal<Record<string, MasterStats>>({});

  // Аккордеон
  readonly expandedResponseId = signal<string | null>(null);

  // Модальный вариант
  readonly modalResponse = signal<Response | null>(null);

  // Рейтинг
  readonly ratingSelected = signal(0);
  readonly ratingHovered = signal(0);
  readonly reviewText = signal('');
  readonly starRange = [1, 2, 3, 4, 5];

  // Чат: ключ — master_id
  readonly chatMessages = signal<Record<string, Message[] | undefined>>({});
  readonly chatDraft = signal<Record<string, string | undefined>>({});
  readonly chatSending = signal(false);

  readonly selectedResponse = computed(() => {
    const order = this.order();
    if (!order?.selected_master_id) return null;
    return this.responses().find(r => r.master_id === order.selected_master_id) ?? null;
  });

  // Жалоба
  readonly complaintOpen = signal(false);
  readonly complaintText = signal('');
  readonly complaintLoading = signal(false);
  readonly complaintSent = signal(false);

  currentUserId = '';
  private readonly loadedChats = new Set<string>();

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.currentUserId = this.auth.user()?.id ?? '';
    if (!id) { this.loading.set(false); return; }

    const [order, responses] = await Promise.all([
      this.orderService.getOrderById(id),
      this.responseService.getResponsesByOrder(id),
    ]);
    this.order.set(order);
    this.responses.set(responses);

    if (order) {
      this.chatService.markAsReadClient(order.id, this.currentUserId);
      this.responseService.markResponsesSeenForOrder(order.id);
    }

    if (responses.length) {
      const stats = await this.orderService.getMasterStats(responses.map(r => r.master_id));
      const map: Record<string, MasterStats> = {};
      for (const s of stats) map[s.master_id] = s;
      this.masterStats.set(map);

      const selected = order?.selected_master_id
        ? responses.find(r => r.master_id === order.selected_master_id)
        : null;
      const firstId = selected?.id ?? responses[0].id;
      this.expandedResponseId.set(firstId);
      const firstMasterId = selected?.master_id ?? responses[0].master_id;
      if (order) await this.openChat(order.id, firstMasterId);
    }

    this.loading.set(false);
  }

  async toggleResponse(responseId: string, masterId: string) {
    const isOpening = this.expandedResponseId() !== responseId;
    this.expandedResponseId.update(cur => cur === responseId ? null : responseId);
    const order = this.order();
    if (isOpening && order && !this.loadedChats.has(masterId)) {
      await this.openChat(order.id, masterId);
    }
  }

  private async openChat(orderId: string, masterId: string) {
    if (this.loadedChats.has(masterId)) return;
    this.loadedChats.add(masterId);

    const msgs = await this.chatService.loadMessages(orderId, masterId);
    this.chatMessages.update(m => ({ ...m, [masterId]: msgs }));

  }

  setChatDraft(masterId: string, text: string) {
    this.chatDraft.update(d => ({ ...d, [masterId]: text }));
  }

  async sendMessage(masterId: string) {
    const order = this.order();
    const content = (this.chatDraft()[masterId] ?? '').trim();
    if (!order || !content || this.chatSending()) return;

    // Оптимистичное добавление
    const tempId = crypto.randomUUID();
    const tempMsg: Message = {
      id: tempId,
      order_id: order.id,
      master_id: masterId,
      sender_id: this.currentUserId,
      content,
      created_at: new Date().toISOString(),
    };
    this.chatMessages.update(m => ({ ...m, [masterId]: [...(m[masterId] ?? []), tempMsg] }));
    this.chatDraft.update(d => ({ ...d, [masterId]: '' }));
    this.scrollChat(masterId);

    this.chatSending.set(true);
    await this.chatService.send(order.id, masterId, this.currentUserId, content);
    this.chatSending.set(false);
  }

  private scrollChat(masterId: string) {
    setTimeout(() => {
      const el = document.getElementById(`chat-${masterId}`);
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }

  openModal(response: Response) { this.modalResponse.set(response); }
  closeModal() { this.modalResponse.set(null); }

  async selectMaster(response: Response) {
    const order = this.order();
    if (!order) return;
    this.actionLoading.set(response.id);
    const ok = await this.orderService.updateOrderStatus(order.id, 'master_selected', response.master_id);
    if (ok) {
      this.order.update(o => o ? { ...o, status: 'master_selected', selected_master_id: response.master_id } : o);
      this.closeModal();
    }
    this.actionLoading.set(null);
  }

  async deleteOrder() {
    const order = this.order();
    if (!order) return;
    if (!confirm(`Удалить заявку «${order.work_types?.name ?? 'Заявка'}»? Это действие необратимо.`)) return;

    this.actionLoading.set('delete');
    const ok = await this.orderService.deleteOrder(order.id);
    this.actionLoading.set(null);

    if (ok) this.router.navigate(['/client/orders']);
  }

  async complete() {
    const order = this.order();
    if (!order) return;
    this.actionLoading.set('complete');
    const ok = await this.orderService.updateOrderStatus(order.id, 'completed');
    if (ok) this.order.update(o => o ? { ...o, status: 'completed' } : o);
    this.actionLoading.set(null);
  }

  async submitRating() {
    const order = this.order();
    const rating = this.ratingSelected();
    if (!order || !rating) return;
    this.actionLoading.set('rating');
    const ok = await this.orderService.rateOrder(order.id, rating, this.reviewText());
    if (ok) this.order.update(o => o ? { ...o, rating, review_text: this.reviewText() || null } : o);
    this.actionLoading.set(null);
  }

  async submitComplaint(masterId: string, masterName: string) {
    const order = this.order();
    const reason = this.complaintText().trim();
    if (!order || !reason) return;
    this.complaintLoading.set(true);
    const ok = await this.complaintService.submit(this.currentUserId, masterId, masterName, reason, order.id);
    this.complaintLoading.set(false);
    if (ok) { this.complaintSent.set(true); this.complaintOpen.set(false); }
  }

  starActive(n: number): boolean {
    const hovered = this.ratingHovered();
    return hovered ? hovered >= n : this.ratingSelected() >= n;
  }

  starsDisplay(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
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

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }
}
