import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StoreService } from '../../../core/services/store.service';
import { ProductUnit } from '../../../core/models/types';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private storeService = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly productId = signal<string | null>(null);

  readonly units: ProductUnit[] = ['шт', 'м²', 'кг', 'л', 'уп'];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    unit: ['шт' as ProductUnit, Validators.required],
    category: [''],
    description: [''],
    in_stock: [true],
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.productId.set(id);
      this.loading.set(true);
      const product = await this.storeService.getProductById(id);
      if (product) {
        this.form.patchValue({
          name: product.name,
          price: product.price,
          unit: product.unit,
          category: product.category ?? '',
          description: product.description ?? '',
          in_stock: product.in_stock,
        });
      }
      this.loading.set(false);
    }
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const user = this.auth.user();
    if (!user) return;

    this.saving.set(true);
    this.error.set(null);

    const { name, price, unit, category, description, in_stock } = this.form.value;
    const payload = {
      name: name!,
      price: price!,
      unit: unit as ProductUnit,
      category: category || null,
      description: description || null,
      in_stock: in_stock ?? true,
    };

    try {
      if (this.isEdit()) {
        await this.storeService.updateProduct(this.productId()!, payload);
      } else {
        await this.storeService.createProduct(user.id, payload);
      }
      await this.router.navigate(['/store/products']);
    } catch {
      this.error.set('Не удалось сохранить товар');
    } finally {
      this.saving.set(false);
    }
  }
}
