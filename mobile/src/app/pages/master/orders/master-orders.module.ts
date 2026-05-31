import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { MasterOrdersPage } from './master-orders.page';

const routes: Routes = [
  { path: '', component: MasterOrdersPage },
  { path: ':id', loadChildren: () => import('../order-detail/master-order-detail.module').then(m => m.MasterOrderDetailPageModule) },
];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [MasterOrdersPage],
})
export class MasterOrdersPageModule {}
