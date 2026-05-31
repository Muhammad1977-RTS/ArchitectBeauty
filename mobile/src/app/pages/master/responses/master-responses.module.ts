import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { MasterResponsesPage } from './master-responses.page';

const routes: Routes = [{ path: '', component: MasterResponsesPage }];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [MasterResponsesPage],
})
export class MasterResponsesPageModule {}
