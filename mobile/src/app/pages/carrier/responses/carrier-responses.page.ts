import { Component, OnInit } from '@angular/core';
import { CarrierService } from '../../../core/services/carrier.service';
import { AuthService } from '../../../core/services/auth.service';
import { TransportResponse } from '../../../core/models/types';

@Component({
  selector: 'app-carrier-responses',
  templateUrl: './carrier-responses.page.html',
  styleUrls: ['./carrier-responses.page.scss'],
  standalone: false,
})
export class CarrierResponsesPage implements OnInit {
  responses: TransportResponse[] = [];
  loading = true;

  constructor(private carrierService: CarrierService, private auth: AuthService) {}

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    const user = this.auth.appUser();
    if (user) this.responses = await this.carrierService.getMyResponses(user.id);
    this.loading = false;
  }

  async refresh(event: any) { await this.load(); event.target.complete(); }
}
