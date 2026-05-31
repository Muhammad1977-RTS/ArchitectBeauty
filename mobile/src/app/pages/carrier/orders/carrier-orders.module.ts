import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { CarrierOrdersPage } from './carrier-orders.page';

const routes: Routes = [
  { path: '', component: CarrierOrdersPage },
  { path: ':id', loadChildren: () => import('../order-detail/carrier-order-detail.module').then(m => m.CarrierOrderDetailPageModule) },
];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [CarrierOrdersPage],
})
export class CarrierOrdersPageModule {}
