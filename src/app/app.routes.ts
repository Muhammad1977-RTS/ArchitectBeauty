import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/onboarding/onboarding').then(m => m.OnboardingComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register').then(m => m.RegisterComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile-edit').then(m => m.ProfileEditComponent),
  },
  {
    path: 'client',
    canActivate: [authGuard, roleGuard],
    data: { role: 'client' },
    children: [
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/client/orders-list/orders-list').then(m => m.ClientOrdersListComponent),
      },
      {
        path: 'orders/new',
        loadComponent: () =>
          import('./features/client/order-create/order-create').then(m => m.OrderCreateComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/client/order-detail/order-detail').then(m => m.ClientOrderDetailComponent),
      },
      {
        path: 'transport-orders',
        loadComponent: () =>
          import('./features/client/transport-orders-list/transport-orders-list').then(m => m.ClientTransportOrdersListComponent),
      },
      {
        path: 'transport-orders/new',
        loadComponent: () =>
          import('./features/client/transport-order-create/transport-order-create').then(m => m.TransportOrderCreateComponent),
      },
      {
        path: 'transport-orders/:id',
        loadComponent: () =>
          import('./features/client/transport-order-detail/transport-order-detail').then(m => m.ClientTransportOrderDetailComponent),
      },
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
    ],
  },
  {
    path: 'master',
    canActivate: [authGuard, roleGuard],
    data: { role: 'master' },
    children: [
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/master/orders-browse/orders-browse').then(m => m.MasterOrdersBrowseComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/master/order-detail/order-detail').then(m => m.MasterOrderDetailComponent),
      },
      {
        path: 'responses',
        loadComponent: () =>
          import('./features/master/my-responses/my-responses').then(m => m.MasterMyResponsesComponent),
      },
      {
        path: 'transport-orders',
        loadComponent: () =>
          import('./features/master/transport-orders-list/transport-orders-list').then(m => m.MasterTransportOrdersListComponent),
      },
      {
        path: 'transport-orders/new',
        loadComponent: () =>
          import('./features/master/transport-order-create/transport-order-create').then(m => m.MasterTransportOrderCreateComponent),
      },
      {
        path: 'transport-orders/:id',
        loadComponent: () =>
          import('./features/master/transport-order-detail/transport-order-detail').then(m => m.MasterTransportOrderDetailComponent),
      },
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
    ],
  },
  {
    path: 'carrier',
    canActivate: [authGuard, roleGuard],
    data: { role: 'carrier' },
    children: [
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/carrier/orders-browse/orders-browse').then(m => m.CarrierOrdersBrowseComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/carrier/order-detail/order-detail').then(m => m.CarrierOrderDetailComponent),
      },
      {
        path: 'responses',
        loadComponent: () =>
          import('./features/carrier/my-responses/my-responses').then(m => m.CarrierMyResponsesComponent),
      },
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
    ],
  },
  {
    path: 'store',
    canActivate: [authGuard, roleGuard],
    data: { role: 'store' },
    children: [
      {
        path: 'products',
        loadComponent: () =>
          import('./features/store/products-list/products-list').then(m => m.StoreProductsListComponent),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/store/product-form/product-form').then(m => m.ProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/store/product-form/product-form').then(m => m.ProductFormComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/store/store-profile/store-profile').then(m => m.StoreProfileComponent),
      },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },
  {
    path: 'shops',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/shops/shops-list/shops-list').then(m => m.ShopsListComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/shops/shop-detail/shop-detail').then(m => m.ShopDetailComponent),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/admin-users').then(m => m.AdminUsersComponent),
      },
      {
        path: 'work-types',
        loadComponent: () =>
          import('./features/admin/work-types/admin-work-types').then(m => m.AdminWorkTypesComponent),
      },
      {
        path: 'complaints',
        loadComponent: () =>
          import('./features/admin/complaints/admin-complaints').then(m => m.AdminComplaintsComponent),
      },
      { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/' },
];
