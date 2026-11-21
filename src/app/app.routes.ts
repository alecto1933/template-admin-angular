import { Routes } from '@angular/router';
import { profileManagementRoute } from '@/core/federation/federated-route';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Masuk · iVendor Superapps',
    loadComponent: () => import('@/pages/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'public/registration',
    title: 'Registrasi Vendor · iVendor Superapps',
    loadComponent: () => import('@/pages/auth/register.page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    loadComponent: () => import('@/layout/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        title: 'Home · iVendor Superapps',
        data: { page: 'Home' },
        loadComponent: () => import('@/pages/home/home.page').then((m) => m.HomePage),
      },
      profileManagementRoute(),
      {
        path: '**',
        loadComponent: () => import('@/pages/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
