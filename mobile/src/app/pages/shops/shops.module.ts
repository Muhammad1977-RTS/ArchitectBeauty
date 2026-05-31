import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ShopsPage } from './shops.page';

const routes: Routes = [{ path: '', component: ShopsPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [ShopsPage],
})
export class ShopsPageModule {}
