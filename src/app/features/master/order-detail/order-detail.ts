import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { ComplaintService } from '../../../core/services/complaint.service';
import { OrderService } from '../../../core/services/order.service';
import { ResponseService } from '../../../core/services/response.service';
import { Order, Response, Message } from '../../../core/models/types';

@Component({
  selector: 'app-master-order-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './order-detail.html',
})
export class MasterOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private responseService = inject(ResponseService);
  private chatService = inject(ChatService);
  private complaintService = inject(ComplaintService);
  private fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly order = signal<Order | null>(null);
  readonly myResponse = signal<Response | null>(null);
  readonly error = signal<string | null>(null);

  readonly chatMessages = signal<Message[]>([]);
  readonly chatDraft = signal('');
  readonly chatSending = signal(false);

  readonly complaintOpen = signal(false);
  readonly complaintText = signal('');
  readonly complaintLoading = signal(false);
  readonly complaintSent = signal(false);

  currentUserId = '';

  form = this.fb.group({
    proposed_price: [null as number | null, [Validators.required, Validators.min(1)]],
    estimated_days: [null as number | null, [Validators.min(1)]],
    comment: [''],
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const user = this.auth.user();
    if (!id || !user) { this.loading.set(false); return; }

    this.currentUserId = user.id;

    const [order, existing] = await Promise.all([
      this.orderService.getOrderById(id),
      this.responseService.getMyResponseForOrder(id, user.id),
    ]);

    this.order.set(order);
    this.myResponse.set(existing);

    if (!existing && order) {
      const rate = await this.responseService.getMasterRateForWorkType(user.id, order.work_type_id);
      if (rate) {
        this.form.patchValue({ proposed_price: Math.round(order.area_sqm * rate) });
      }
    }

    if (order) {
      const msgs = await this.chatService.loadMessages(order.id, user.id);
      this.chatMessages.set(msgs);
      await this.chatService.markAsRead(order.id, user.id);

    }

    this.loading.set(false);
  }

  async sendMessage() {
    const order = this.order();
    const content = this.chatDraft().trim();
    if (!order || !content || this.chatSending()) return;

    const tempMsg: Message = {
      id: crypto.randomUUID(),
      order_id: order.id,
      master_id: this.currentUserId,
      sender_id: this.currentUserId,
      content,
      created_at: new Date().toISOString(),
    };
    this.chatMessages.update(list => [...list, tempMsg]);
    this.chatDraft.set('');
    this.scrollChat();

    this.chatSending.set(true);
    await this.chatService.send(order.id, this.currentUserId, this.currentUserId, content);
    this.chatSending.set(false);
  }

  private scrollChat() {
    setTimeout(() => {
      const el = document.getElementById('master-chat');
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }

  async submit() {
    if (this.form.invalid) return;
    const user = this.auth.user();
    const order = this.order();
    if (!user || !order) return;

    this.submitting.set(true);
    this.error.set(null);

    const { proposed_price, estimated_days, comment } = this.form.value;
    const response = await this.responseService.createResponse({
      order_id: order.id,
      master_id: user.id,
      proposed_price: proposed_price!,
      estimated_days: estimated_days ?? null,
      comment: comment ?? '',
    });

    this.submitting.set(false);

    if (response) {
      this.myResponse.set(response);
    } else {
      this.error.set('Не удалось отправить отклик. Попробуйте снова.');
    }
  }

  async submitComplaint() {
    const order = this.order();
    const reason = this.complaintText().trim();
    if (!order || !reason) return;
    const clientName = order.profiles?.name ?? 'Клиент';
    const clientId = order.client_id;
    this.complaintLoading.set(true);
    const ok = await this.complaintService.submit(this.currentUserId, clientId, clientName, reason, order.id);
    this.complaintLoading.set(false);
    if (ok) { this.complaintSent.set(true); this.complaintOpen.set(false); }
  }

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ru-RU', {
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
