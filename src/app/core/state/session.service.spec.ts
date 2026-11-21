import { TestBed } from '@angular/core/testing';
import { appKey, readJson, writeJson } from '@/core/storage';
import { DEMO_USER, SessionService } from '@/core/state/session.service';

describe('SessionService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts without a session', () => {
    const session = TestBed.inject(SessionService);

    expect(session.user()).toBeNull();
    expect(session.isAuthenticated()).toBe(false);
    expect(session.permissions()).toEqual([]);
    expect(session.initials()).toBe('');
  });

  it('rehydrates a persisted session', () => {
    writeJson(appKey('session'), DEMO_USER);
    const session = TestBed.inject(SessionService);

    expect(session.user()).toEqual(DEMO_USER);
    expect(session.isAuthenticated()).toBe(true);
    expect(session.initials()).toBe('RP');
  });

  it('ignores a malformed stored session', () => {
    localStorage.setItem(appKey('session'), '{}');
    const session = TestBed.inject(SessionService);

    expect(session.isAuthenticated()).toBe(false);
    expect(session.permissions()).toEqual([]);
  });

  it('logs in with the demo user and persists it', () => {
    const session = TestBed.inject(SessionService);

    session.login();

    expect(session.user()).toEqual(DEMO_USER);
    expect(session.isAuthenticated()).toBe(true);
    expect(session.initials()).toBe('RP');
    expect(readJson(appKey('session'))).toEqual(DEMO_USER);
  });

  it('checks permissions', () => {
    const session = TestBed.inject(SessionService);
    session.login();

    expect(session.hasPermission('orders.write')).toBe(true);
    expect(session.hasPermission('billing.manage')).toBe(false);
  });

  it('logs out and clears the stored session', () => {
    const session = TestBed.inject(SessionService);
    session.login();

    session.logout();

    expect(session.user()).toBeNull();
    expect(session.isAuthenticated()).toBe(false);
    expect(readJson(appKey('session'))).toBeNull();
  });

  it('rehydrates permissions from the stored session', () => {
    writeJson(appKey('session'), DEMO_USER);
    const session = TestBed.inject(SessionService);

    expect(session.permissions()).toEqual(DEMO_USER.permissions);
    expect(session.hasPermission('settings.manage')).toBe(true);
    expect(session.hasPermission('orders.read')).toBe(true);
  });

  it('ignores a stored session with missing fields', () => {
    writeJson(appKey('session'), { id: 'usr-9', name: 'Tanpa Role' });
    const session = TestBed.inject(SessionService);

    expect(session.user()).toBeNull();
    expect(session.isAuthenticated()).toBe(false);
    expect(session.initials()).toBe('');
  });

  it('ignores a stored session whose permissions are not an array', () => {
    writeJson(appKey('session'), { ...DEMO_USER, permissions: 'orders.read' });
    const session = TestBed.inject(SessionService);

    expect(session.user()).toBeNull();
  });

  it('logs in with a custom user and derives initials from two names', () => {
    const session = TestBed.inject(SessionService);
    const user = {
      id: 'usr-42',
      name: 'dewi lestari putri',
      email: 'dewi@example.com',
      role: 'Viewer',
      permissions: ['orders.read'],
    };

    session.login(user);

    expect(session.user()).toEqual(user);
    expect(session.initials()).toBe('DL');
    expect(readJson(appKey('session'))).toEqual(user);
  });

  it('rehydrates a session persisted by login', () => {
    TestBed.inject(SessionService).login();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const rehydrated = TestBed.inject(SessionService);

    expect(rehydrated.user()).toEqual(DEMO_USER);
    expect(rehydrated.isAuthenticated()).toBe(true);
  });
});
