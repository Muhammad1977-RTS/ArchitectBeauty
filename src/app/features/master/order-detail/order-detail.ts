import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { ResponseService } from '../../../core/services/response.service';
import { Order, Response } from '../../../core/models/types';

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
  private fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly order = signal<Order | null>(null);
  readonly myResponse = signal<Response | null>(null);
  readonly error = signal<string | null>(null);

  form = this.fb.group({
    proposed_price: [null as number | null, [Validators.required, Validators.min(1)]],
    estimated_days: [null as number | null, [Validators.min(1)]],
    comment: [''],
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const user = this.auth.user();
    if (!id || !user) { this.loading.set(false); return; }

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

    this.loading.set(false);
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

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }
}
