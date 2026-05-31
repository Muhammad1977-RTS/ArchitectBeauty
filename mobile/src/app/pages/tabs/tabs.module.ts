import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'client-orders',
        loadChildren: () => import('../client/orders/client-orders.module').then(m => m.ClientOrdersPageModule),
      },
      {
        path: 'master-orders',
        loadChildren: () => import('../master/orders/master-orders.module').then(m => m.MasterOrdersPageModule),
      },
      {
        path: 'master-responses',
        loadChildren: () => import('../master/responses/master-responses.module').then(m => m.MasterResponsesPageModule),
      },
      {
        path: 'carrier-orders',
        loadChildren: () => import('../carrier/orders/carrier-orders.module').then(m => m.CarrierOrdersPageModule),
      },
      {
        path: 'carrier-responses',
        loadChildren: () => import('../carrier/responses/carrier-responses.module').then(m => m.CarrierResponsesPageModule),
      },
      {
        path: 'client-transport',
        loadChildren: () => import('../client/transport/client-transport.module').then(m => m.ClientTransportPageModule),
      },
      {
        path: 'shops',
        loadChildren: () => import('../shops/shops.module').then(m => m.ShopsPageModule),
      },
      {
        path: 'store-products',
        loadChildren: () => import('../store/products/store-products.module').then(m => m.StoreProductsPageModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule),
      },
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [TabsPage],
})
export class TabsPageModule {}
