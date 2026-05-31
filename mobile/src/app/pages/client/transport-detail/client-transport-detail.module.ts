import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ClientTransportDetailPage } from './client-transport-detail.page';

const routes: Routes = [{ path: '', component: ClientTransportDetailPage }];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [ClientTransportDetailPage],
})
export class ClientTransportDetailPageModule {}
