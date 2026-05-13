import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { StoreService } from '../../../core/services/store.service';
import { Product, StoreProfile } from '../../../core/models/types';

@Component({
  selector: 'app-shop-detail',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './shop-detail.html',
})
export class ShopDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private storeService = inject(StoreService);

  readonly store = signal<StoreProfile | null>(null);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly activeCategory = signal<string | null>(null);

  readonly categories = computed(() => {
    const cats = this.products()
      .map(p => p.category)
      .filter((c): c is string => !!c);
    return [...new Set(cats)];
  });

  readonly filtered = computed(() => {
    const cat = this.activeCategory();
    if (!cat) return this.products();
    return this.products().filter(p => p.category === cat);
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const [store, products] = await Promise.all([
      this.storeService.getStoreById(id),
      this.storeService.getProductsByStore(id),
    ]);
    this.store.set(store);
    this.products.set(products);
    this.loading.set(false);
  }
}
