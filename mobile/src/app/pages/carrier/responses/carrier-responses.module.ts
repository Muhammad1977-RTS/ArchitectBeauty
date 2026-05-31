import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { CarrierResponsesPage } from './carrier-responses.page';

const routes: Routes = [{ path: '', component: CarrierResponsesPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [CarrierResponsesPage],
})
export class CarrierResponsesPageModule {}
