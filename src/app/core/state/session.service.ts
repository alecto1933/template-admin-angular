import { computed, Injectable, signal } from '@angular/core';
import { appKey, readJson, remove, writeJson } from '../storage';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

const SESSION_KEY = appKey('session');

export const DEMO_USER: SessionUser = {
  id: 'usr-001',
  name: 'Raka Pratama',
  email: 'raka@alecto.id',
  role: 'Admin',
  permissions: ['orders.read', 'orders.write', 'settings.manage'],
};

function readStoredUser(): SessionUser | null {
  const value = readJson<Partial<SessionUser>>(SESSION_KEY);
  if (
    !value ||
    typeof value.id !== 'string' ||
    typeof value.name !== 'string' ||
    typeof value.email !== 'string' ||
    typeof value.role !== 'string' ||
    !Array.isArray(value.permissions)
  ) {
    return null;
  }
  return value as SessionUser;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _user = signal<SessionUser | null>(readStoredUser());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly permissions = computed(() => this._user()?.permissions ?? []);
  readonly initials = computed(() => initialsOf(this._user()?.name ?? ''));

  login(user: SessionUser = DEMO_USER): void {
    this._user.set(user);
    writeJson(SESSION_KEY, user);
  }

  logout(): void {
    this._user.set(null);
    remove(SESSION_KEY);
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }
}
