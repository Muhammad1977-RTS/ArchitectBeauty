import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ResponseService } from '../../../core/services/response.service';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, Response, Message } from '../../../core/models/types';

@Component({
  selector: 'app-master-order-detail',
  templateUrl: './master-order-detail.page.html',
  styleUrls: ['./master-order-detail.page.scss'],
  standalone: false,
})
export class MasterOrderDetailPage implements OnInit {
  order: Order | null = null;
  myResponse: Response | null = null;
  messages: Message[] = [];
  newMessage = '';
  loading = true;
  respondForm: FormGroup;
  submitting = false;
  private pollInterval: any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private orderService: OrderService,
    private responseService: ResponseService,
    private chatService: ChatService,
    public auth: AuthService,
  ) {
    this.respondForm = this.fb.group({
      proposed_price: ['', [Validators.required, Validators.min(1)]],
      comment: [''],
      estimated_days: [null],
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    await this.loadAll(id);
    this.pollInterval = setInterval(() => this.loadMessages(id), 5000);
  }

  ngOnDestroy() { clearInterval(this.pollInterval); }

  async loadAll(id: string) {
    this.loading = true;
    const user = this.auth.appUser()!;
    [this.order, this.myResponse] = await Promise.all([
      this.orderService.getOrderById(id),
      this.responseService.getMyResponseForOrder(id, user.id),
    ]);
    if (this.order?.selected_master_id === user.id) {
      await this.loadMessages(id);
    }
    this.loading = false;
  }

  async loadMessages(id: string) {
    const user = this.auth.appUser()!;
    if (this.order?.selected_master_id !== user.id) return;
    this.messages = await this.chatService.loadMessages(id, user.id);
  }

  async respond() {
    if (this.respondForm.invalid || !this.order) return;
    this.submitting = true;
    const user = this.auth.appUser()!;
    await this.responseService.createResponse({
      order_id: this.order.id,
      master_id: user.id,
      ...this.respondForm.value,
    });
    this.submitting = false;
    await this.loadAll(this.order.id);
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.order) return;
    const user = this.auth.appUser()!;
    await this.chatService.send(this.order.id, user.id, this.newMessage.trim());
    this.newMessage = '';
    await this.loadMessages(this.order.id);
  }
}

