import { Route } from '@angular/router';
import { routes } from '@/app.routes';

function findRoute(path: string): Route {
  const route = routes.find((item) => item.path === path);
  expect(route, `route "${path}"`).toBeDefined();
  return route as Route;
}

describe('app routes', () => {
  it('exposes the login route with a lazy loader', () => {
    const login = findRoute('login');

    expect(login.title).toBe('Masuk · iVendor Superapps');
    expect(typeof login.loadComponent).toBe('function');
    expect(login.redirectTo).toBeUndefined();
  });

  it('exposes the register route with a lazy loader', () => {
    const register = findRoute('public/registration');

    expect(register.title).toBe('Registrasi Vendor · iVendor Superapps');
    expect(typeof register.loadComponent).toBe('function');
    expect(register.redirectTo).toBeUndefined();
  });

  it('wraps the authenticated pages in the app shell', () => {
    const shell = findRoute('');

    expect(typeof shell.loadComponent).toBe('function');
    expect(shell.children?.length).toBe(4);
  });

  it('declares the profile management child route before the wildcard', () => {
    const shell = findRoute('');
    const profile = shell.children?.find((child) => child.path === 'profile-management');

    expect(profile).toBeDefined();
    expect(profile?.data).toEqual({ page: 'profileManagement' });
    expect(profile?.providers).toHaveLength(1);
    expect(typeof profile?.loadChildren).toBe('function');
    expect(shell.children?.at(-1)?.path).toBe('**');
  });

  it('redirects the shell root to home', () => {
    const shell = findRoute('');
    const rootChild = shell.children?.find((child) => child.path === '');

    expect(rootChild?.pathMatch).toBe('full');
    expect(rootChild?.redirectTo).toBe('home');
  });

  it('declares the home child route', () => {
    const shell = findRoute('');
    const home = shell.children?.find((child) => child.path === 'home');

    expect(home).toBeDefined();
    expect(home?.title).toBe('Home · iVendor Superapps');
    expect(home?.data).toEqual({ page: 'Home' });
    expect(typeof home?.loadComponent).toBe('function');
  });

  it('declares a wildcard child route as the last entry', () => {
    const shell = findRoute('');
    const children = shell.children ?? [];

    expect(children.at(-1)?.path).toBe('**');
    expect(typeof children.at(-1)?.loadComponent).toBe('function');
  });

  it('only uses lazy component loaders that are functions', () => {
    for (const route of routes) {
      if (route.redirectTo) {
        expect(route.loadComponent, `redirect "${route.path}"`).toBeUndefined();
        continue;
      }
      expect(typeof route.loadComponent, `route "${route.path}"`).toBe('function');
    }
  });
});
