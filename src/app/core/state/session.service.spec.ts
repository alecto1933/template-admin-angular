import { TestBed } from '@angular/core/testing';
import { appKey, readJson, writeJson } from '../storage';
import { DEMO_USER, SessionService } from './session.service';

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
});
