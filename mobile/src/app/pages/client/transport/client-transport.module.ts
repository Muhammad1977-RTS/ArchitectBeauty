import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ClientTransportPage } from './client-transport.page';

const routes: Routes = [
  { path: '', component: ClientTransportPage },
  { path: ':id', loadChildren: () => import('../transport-detail/client-transport-detail.module').then(m => m.ClientTransportDetailPageModule) },
];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [ClientTransportPage],
})
export class ClientTransportPageModule {}
