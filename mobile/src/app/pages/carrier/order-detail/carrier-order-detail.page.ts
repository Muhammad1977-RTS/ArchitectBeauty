import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarrierService } from '../../../core/services/carrier.service';
import { AuthService } from '../../../core/services/auth.service';
import { TransportOrder, TransportResponse } from '../../../core/models/types';

@Component({
  selector: 'app-carrier-order-detail',
  templateUrl: './carrier-order-detail.page.html',
  styleUrls: ['./carrier-order-detail.page.scss'],
  standalone: false,
})
export class CarrierOrderDetailPage implements OnInit {
  order: TransportOrder | null = null;
  myResponse: TransportResponse | null = null;
  loading = true;
  respondForm: FormGroup;
  submitting = false;

  vehicleTypes = [
    { value: 'car', label: 'Легковая' },
    { value: 'minivan', label: 'Минивэн' },
    { value: 'gazelle', label: 'Газель' },
    { value: 'truck', label: 'Грузовик' },
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private carrierService: CarrierService,
    public auth: AuthService,
  ) {
    this.respondForm = this.fb.group({
      proposed_price: ['', [Validators.required, Validators.min(1)]],
      vehicle_type: ['gazelle', Validators.required],
      comment: [''],
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const user = this.auth.appUser()!;
    this.loading = true;
    [this.order, this.myResponse] = await Promise.all([
      this.carrierService.getTransportOrderById(id),
      this.carrierService.getMyResponseForOrder(id, user.id),
    ]);
    this.loading = false;
  }

  async respond() {
    if (this.respondForm.invalid || !this.order) return;
    this.submitting = true;
    const user = this.auth.appUser()!;
    await this.carrierService.createResponse({
      order_id: this.order.id,
      carrier_id: user.id,
      ...this.respondForm.value,
    });
    this.submitting = false;
    const id = this.route.snapshot.paramMap.get('id')!;
    this.myResponse = await this.carrierService.getMyResponseForOrder(id, user.id);
  }
}
