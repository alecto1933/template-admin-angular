import { TestBed } from '@angular/core/testing';
import { readString } from '@/core/storage';
import { PreferencesService } from '@/core/state/preferences.service';
import { ThemeService } from '@/core/theme/theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light mode and toggles', () => {
    const service = TestBed.inject(ThemeService);

    service.set('light');
    expect(service.theme()).toBe('light');
    expect(service.isDark()).toBe(false);

    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('can set an explicit theme', () => {
    const service = TestBed.inject(ThemeService);

    service.set('dark');
    expect(service.isDark()).toBe(true);

    service.set('light');
    expect(service.isDark()).toBe(false);
  });

  it('delegates to the preferences service', () => {
    const preferences = TestBed.inject(PreferencesService);
    const service = TestBed.inject(ThemeService);

    service.set('dark');

    expect(preferences.theme()).toBe('dark');
    expect(service.theme()).toBe(preferences.theme());

    service.toggle();

    expect(preferences.theme()).toBe('light');
    expect(service.theme()).toBe('light');
  });

  it('applies the theme class and persists the preference', () => {
    const service = TestBed.inject(ThemeService);

    service.set('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(readString('alecto-theme')).toBe('dark');

    service.toggle();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(readString('alecto-theme')).toBe('light');
  });

  it('hydrates the theme from storage', () => {
    localStorage.setItem('alecto-theme', 'dark');
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });
});
