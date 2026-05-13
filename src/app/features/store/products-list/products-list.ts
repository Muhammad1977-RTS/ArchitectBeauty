import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StoreService } from '../../../core/services/store.service';
import { Product } from '../../../core/models/types';

@Component({
  selector: 'app-store-products-list',
  imports: [RouterLink],
  templateUrl: './products-list.html',
})
export class StoreProductsListComponent implements OnInit {
  private auth = inject(AuthService);
  private storeService = inject(StoreService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly deletingId = signal<string | null>(null);

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) return;
    this.products.set(await this.storeService.getMyProducts(user.id));
    this.loading.set(false);
  }

  async delete(id: string) {
    this.deletingId.set(id);
    await this.storeService.deleteProduct(id);
    this.products.update(list => list.filter(p => p.id !== id));
    this.deletingId.set(null);
  }
}
