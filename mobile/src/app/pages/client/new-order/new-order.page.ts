import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { WorkType } from '../../../core/models/types';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.page.html',
  styleUrls: ['./new-order.page.scss'],
  standalone: false,
})
export class NewOrderPage implements OnInit {
  form: FormGroup;
  workTypes: WorkType[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private profileService: ProfileService,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      work_type_id: ['', Validators.required],
      area_sqm: ['', [Validators.required, Validators.min(1)]],
      address: ['', Validators.required],
      description: [''],
    });
  }

  async ngOnInit() {
    this.workTypes = await this.profileService.getWorkTypes();
  }

  async submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const user = this.auth.appUser();
    const order = await this.orderService.createOrder({
      client_id: user!.id,
      ...this.form.value,
      photo_urls: [],
    });
    this.loading = false;
    if (order) this.router.navigate(['/tabs/client-orders']);
  }
}
