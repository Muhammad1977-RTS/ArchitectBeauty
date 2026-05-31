import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { StoreService } from '../../../core/services/store.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/types';

@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.page.html',
  styleUrls: ['./store-products.page.scss'],
  standalone: false,
})
export class StoreProductsPage implements OnInit {
  products: Product[] = [];
  loading = true;
  showForm = false;
  form: FormGroup;
  submitting = false;

  units = ['шт', 'м²', 'кг', 'л', 'уп'];

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private auth: AuthService,
    private alert: AlertController,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      unit: ['шт', Validators.required],
      category: [''],
      in_stock: [true],
    });
  }

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    const user = this.auth.appUser();
    if (user) this.products = await this.storeService.getMyProducts(user.id);
    this.loading = false;
  }

  async refresh(event: any) { await this.load(); event.target.complete(); }

  async addProduct() {
    if (this.form.invalid) return;
    this.submitting = true;
    const user = this.auth.appUser()!;
    await this.storeService.createProduct(user.id, this.form.value);
    this.submitting = false;
    this.showForm = false;
    this.form.reset({ unit: 'шт', in_stock: true });
    await this.load();
  }

  async deleteProduct(id: string) {
    const alert = await this.alert.create({
      header: 'Удалить товар?',
      buttons: [
        { text: 'Отмена', role: 'cancel' },
        { text: 'Удалить', role: 'destructive', handler: async () => {
          await this.storeService.deleteProduct(id);
          await this.load();
        }},
      ],
    });
    await alert.present();
  }
}

