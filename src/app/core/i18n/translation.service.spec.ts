import { TestBed } from '@angular/core/testing';
import { LAYOUT_TEXTS } from '@/core/i18n/layout.texts';
import { TranslationService } from '@/core/i18n/translation.service';
import { PreferencesService } from '@/core/state/preferences.service';
import { appKey, writeString } from '@/core/storage';

describe('TranslationService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('defaults to Indonesian layout texts', () => {
    const service = TestBed.inject(TranslationService);

    expect(service.lang()).toBe('id');
    expect(service.layout()).toEqual(LAYOUT_TEXTS.id);
    expect(service.layout().logout).toBe('Keluar');
  });

  it('switches layout texts for id -> en -> ja', () => {
    const service = TestBed.inject(TranslationService);

    service.setLanguage('en');
    expect(service.lang()).toBe('en');
    expect(service.layout()).toEqual(LAYOUT_TEXTS.en);
    expect(service.layout().logout).toBe('Sign out');

    service.setLanguage('ja');
    expect(service.lang()).toBe('ja');
    expect(service.layout()).toEqual(LAYOUT_TEXTS.ja);
    expect(service.layout().logout).toBe('ログアウト');

    service.setLanguage('id');
    expect(service.lang()).toBe('id');
    expect(service.layout()).toEqual(LAYOUT_TEXTS.id);
  });

  it('delegates setLanguage to the preferences service', () => {
    const preferences = TestBed.inject(PreferencesService);
    const service = TestBed.inject(TranslationService);

    service.setLanguage('ja');

    expect(preferences.language()).toBe('ja');
    expect(service.lang()).toBe(preferences.language());
  });

  it('hydrates the language from storage', () => {
    writeString(appKey('language'), 'en');
    const service = TestBed.inject(TranslationService);

    expect(service.lang()).toBe('en');
    expect(service.layout()).toEqual(LAYOUT_TEXTS.en);
  });
});
