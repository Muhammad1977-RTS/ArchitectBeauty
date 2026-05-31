import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarrierService } from '../../../core/services/carrier.service';
import { AuthService } from '../../../core/services/auth.service';
import { TransportOrder } from '../../../core/models/types';

@Component({
  selector: 'app-client-transport',
  templateUrl: './client-transport.page.html',
  styleUrls: ['./client-transport.page.scss'],
  standalone: false,
})
export class ClientTransportPage implements OnInit {
  orders: TransportOrder[] = [];
  loading = true;
  showForm = false;
  form: FormGroup;
  submitting = false;

  statusLabels: Record<string, string> = {
    new: 'Новая', carrier_selected: 'Перевозчик выбран', completed: 'Завершена', cancelled: 'Отменена',
  };
  statusColors: Record<string, string> = {
    new: 'success', carrier_selected: 'warning', completed: 'tertiary', cancelled: 'medium',
  };

  constructor(
    private fb: FormBuilder,
    private carrierService: CarrierService,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      from_address: ['', Validators.required],
      to_address: ['', Validators.required],
      cargo_description: ['', Validators.required],
      cargo_weight_kg: [null],
      budget: [null],
      transport_date: [null],
    });
  }

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    const user = this.auth.appUser();
    if (user) this.orders = await this.carrierService.getClientTransportOrders(user.id);
    this.loading = false;
  }

  async refresh(event: any) { await this.load(); event.target.complete(); }

  async create() {
    if (this.form.invalid) return;
    this.submitting = true;
    const user = this.auth.appUser()!;
    await this.carrierService.createTransportOrder({ client_id: user.id, ...this.form.value });
    this.submitting = false;
    this.showForm = false;
    this.form.reset();
    await this.load();
  }
}
