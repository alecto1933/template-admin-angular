import { TestBed } from '@angular/core/testing';
import { LanguageService } from '@/core/language.service';
import { PreferencesService } from '@/core/state/preferences.service';
import { appKey, readString, writeString } from '@/core/storage';

describe('LanguageService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('defaults to Indonesian', () => {
    const service = TestBed.inject(LanguageService);

    expect(service.lang()).toBe('id');
  });

  it('delegates to the preferences service', () => {
    const preferences = TestBed.inject(PreferencesService);
    const service = TestBed.inject(LanguageService);

    service.set('en');

    expect(service.lang()).toBe('en');
    expect(preferences.language()).toBe('en');
  });

  it('persists the Japanese language', () => {
    const service = TestBed.inject(LanguageService);

    service.set('ja');

    expect(service.lang()).toBe('ja');
    expect(readString(appKey('language'))).toBe('ja');
  });

  it('hydrates the language from storage', () => {
    writeString(appKey('language'), 'ja');
    const service = TestBed.inject(LanguageService);

    expect(service.lang()).toBe('ja');
  });
});
