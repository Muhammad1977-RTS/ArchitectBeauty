import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { MasterOrderDetailPage } from './master-order-detail.page';

const routes: Routes = [{ path: '', component: MasterOrderDetailPage }];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [MasterOrderDetailPage],
})
export class MasterOrderDetailPageModule {}


