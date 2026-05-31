import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ClientOrdersPage } from './client-orders.page';

const routes: Routes = [
  { path: '', component: ClientOrdersPage },
  { path: 'new', loadChildren: () => import('../new-order/new-order.module').then(m => m.NewOrderPageModule) },
  { path: ':id', loadChildren: () => import('../order-detail/order-detail.module').then(m => m.OrderDetailPageModule) },
];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [ClientOrdersPage],
})
export class ClientOrdersPageModule {}
