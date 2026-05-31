import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ResponseService } from '../../../core/services/response.service';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, Response, Message } from '../../../core/models/types';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
  standalone: false,
})
export class OrderDetailPage implements OnInit, OnDestroy {
  order: Order | null = null;
  responses: Response[] = [];
  messages: Message[] = [];
  newMessage = '';
  loading = true;
  private pollInterval: any;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private responseService: ResponseService,
    private chatService: ChatService,
    public auth: AuthService,
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    await this.loadAll(id);
    this.pollInterval = setInterval(() => this.loadMessages(id), 5000);
  }

  ngOnDestroy() {
    clearInterval(this.pollInterval);
  }

  async loadAll(id: string) {
    this.loading = true;
    [this.order, this.responses] = await Promise.all([
      this.orderService.getOrderById(id),
      this.responseService.getResponsesByOrder(id),
    ]);
    if (this.order?.selected_master_id) {
      await this.loadMessages(id);
    }
    this.loading = false;
  }

  async loadMessages(id: string) {
    if (!this.order?.selected_master_id) return;
    this.messages = await this.chatService.loadMessages(id, this.order.selected_master_id);
  }

  async selectMaster(masterId: string) {
    if (!this.order) return;
    await this.orderService.updateOrderStatus(this.order.id, 'master_selected', masterId);
    await this.loadAll(this.order.id);
  }

  async complete() {
    if (!this.order) return;
    await this.orderService.rateOrder(this.order.id, 5);
    await this.loadAll(this.order.id);
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.order?.selected_master_id) return;
    await this.chatService.send(this.order.id, this.order.selected_master_id, this.newMessage.trim());
    this.newMessage = '';
    await this.loadMessages(this.order.id);
  }

  statusLabel(s: string) {
    const map: Record<string, string> = { new: 'Новая', master_selected: 'Мастер выбран', completed: 'Завершена' };
    return map[s] ?? s;
  }
}

