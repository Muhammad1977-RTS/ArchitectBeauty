import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../core/services/store.service';
import { StoreProfile } from '../../core/models/types';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.page.html',
  styleUrls: ['./shops.page.scss'],
  standalone: false,
})
export class ShopsPage implements OnInit {
  shops: StoreProfile[] = [];
  loading = true;

  constructor(private storeService: StoreService) {}

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    this.shops = await this.storeService.getStores();
    this.loading = false;
  }

  async refresh(event: any) { await this.load(); event.target.complete(); }

  call(phone: string) {
    window.open(`tel:${phone}`);
  }
}
