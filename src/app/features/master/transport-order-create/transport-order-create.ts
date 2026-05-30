import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarrierService } from '../../../core/services/carrier.service';

@Component({
  selector: 'app-master-transport-order-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './transport-order-create.html',
})
export class MasterTransportOrderCreateComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private carrierService = inject(CarrierService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  form = this.fb.group({
    from_address: ['', Validators.required],
    to_address: ['', Validators.required],
    cargo_description: ['', Validators.required],
    cargo_weight_kg: [null as number | null],
    cargo_volume_m3: [null as number | null],
    transport_date: [null as string | null],
    budget: [null as number | null],
  });

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const user = this.auth.user();
    if (!user) return;

    this.loading.set(true);
    this.error.set(null);

    const v = this.form.value;
    const order = await this.carrierService.createTransportOrder({
      client_id: user.id,
      from_address: v.from_address!,
      to_address: v.to_address!,
      cargo_description: v.cargo_description!,
      cargo_weight_kg: v.cargo_weight_kg ?? null,
      cargo_volume_m3: v.cargo_volume_m3 ?? null,
      transport_date: v.transport_date || null,
      budget: v.budget ?? null,
    });

    this.loading.set(false);

    if (order) {
      await this.router.navigate(['/master/transport-orders']);
    } else {
      this.error.set('Не удалось создать заявку. Попробуйте снова.');
    }
  }
}
