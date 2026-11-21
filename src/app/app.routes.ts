import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth/login',
    title: 'Masuk · iVendor Superapps',
    loadComponent: () => import('./pages/auth/login.page').then((m) => m.LoginPage),
  },
  { path: 'login', redirectTo: 'auth/login' },
  {
    path: 'auth/register',
    title: 'Registrasi Vendor · iVendor Superapps',
    loadComponent: () => import('./pages/auth/register.page').then((m) => m.RegisterPage),
  },
  { path: 'register', redirectTo: 'auth/register' },
  {
    path: '',
    loadComponent: () => import('./layout/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        title: 'Home · iVendor Superapps',
        data: { page: 'Home' },
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
