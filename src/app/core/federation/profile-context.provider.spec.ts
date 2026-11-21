import { Component, Injector, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '@env/environment';
import { PROFILE_CONTEXT, ProfileContext } from '@/core/federation/federation.contract';
import { provideProfileContext } from '@/core/federation/profile-context.provider';
import { TranslationService } from '@/core/i18n/translation.service';
import { PreferencesService } from '@/core/state/preferences.service';
import { SessionService } from '@/core/state/session.service';

@Component({
  selector: 'app-profile-context-probe',
  template: '',
})
class ProfileContextProbe {
  private readonly injector = inject(Injector);

  readonly context = this.injector.get<ProfileContext | null>(PROFILE_CONTEXT, null);
}

function readContext(): ProfileContext {
  const context = TestBed.inject(Injector).get<ProfileContext | null>(PROFILE_CONTEXT, null);
  expect(context).not.toBeNull();
  return context as ProfileContext;
}

describe('provideProfileContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('exposes live language, theme and user readers', () => {
    TestBed.configureTestingModule({ providers: [provideProfileContext()] });
    const context = readContext();

    const i18n = TestBed.inject(TranslationService);
    expect(context.lang()).toBe('id');
    i18n.setLanguage('ja');
    expect(context.lang()).toBe('ja');

    const preferences = TestBed.inject(PreferencesService);
    expect(context.theme()).toBe('light');
    preferences.setTheme('dark');
    expect(context.theme()).toBe('dark');

    const session = TestBed.inject(SessionService);
    expect(context.user()).toBeNull();
    session.login();
    expect(context.user()).not.toBeNull();
    expect(context.user()?.id).toBe(session.user()?.id);
    session.logout();
    expect(context.user()).toBeNull();

    expect(context.assetBase).toBe(environment.remoteAssetBase);
  });

  it('is readable through Injector.get with the shared token string', () => {
    TestBed.configureTestingModule({ providers: [provideProfileContext()] });

    const context = TestBed.inject(Injector).get(PROFILE_CONTEXT, null);

    expect(PROFILE_CONTEXT).toBe('IVENDOR_PROFILE_CONTEXT');
    expect(context).not.toBeNull();
  });

  it('resolves the contract inside a child route component', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'profile-management',
            providers: [provideProfileContext()],
            children: [{ path: '', component: ProfileContextProbe }],
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    const probe = await harness.navigateByUrl('/profile-management', ProfileContextProbe);

    expect(probe.context).not.toBeNull();
    expect(probe.context?.assetBase).toBe(environment.remoteAssetBase);
    expect(probe.context?.lang()).toBe('id');
  });
});
