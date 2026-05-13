import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../../core/services/store.service';
import { StoreProfile } from '../../../core/models/types';

@Component({
  selector: 'app-shops-list',
  imports: [RouterLink],
  templateUrl: './shops-list.html',
})
export class ShopsListComponent implements OnInit {
  private storeService = inject(StoreService);

  readonly stores = signal<StoreProfile[]>([]);
  readonly loading = signal(true);

  async ngOnInit() {
    this.stores.set(await this.storeService.getStores());
    this.loading.set(false);
  }
}
