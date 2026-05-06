import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
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
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/auth/login' },
];
