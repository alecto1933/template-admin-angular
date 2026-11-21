import { TestBed } from '@angular/core/testing';
import { appKey, readString, writeString } from '@/core/storage';
import { PreferencesService } from '@/core/state/preferences.service';

describe('PreferencesService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    TestBed.configureTestingModule({});
  });

  it('defaults to light theme, Indonesian language, and collapsed sidebar', () => {
    const preferences = TestBed.inject(PreferencesService);

    expect(preferences.theme()).toBe('light');
    expect(preferences.language()).toBe('id');
    expect(preferences.sidebarCollapsed()).toBe(true);
  });

  it('persists the selected language', () => {
    const preferences = TestBed.inject(PreferencesService);

    preferences.setLanguage('en');

    expect(preferences.language()).toBe('en');
    expect(readString(appKey('language'))).toBe('en');
  });

  it('persists the sidebar state', () => {
    const preferences = TestBed.inject(PreferencesService);

    preferences.toggleSidebar();

    expect(preferences.sidebarCollapsed()).toBe(false);
    expect(readString(appKey('sidebar-collapsed'))).toBe('false');
  });

  it('toggles the theme and applies the dark class', () => {
    const preferences = TestBed.inject(PreferencesService);

    preferences.setTheme('light');
    preferences.toggleTheme();

    expect(preferences.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(readString('alecto-theme')).toBe('dark');
  });

  it('hydrates the English language from storage', () => {
    writeString(appKey('language'), 'en');
    const preferences = TestBed.inject(PreferencesService);

    expect(preferences.language()).toBe('en');
  });

  it('hydrates the Japanese language from storage', () => {
    writeString(appKey('language'), 'ja');
    const preferences = TestBed.inject(PreferencesService);

    expect(preferences.language()).toBe('ja');
  });

  it('ignores an unsupported stored language', () => {
    writeString(appKey('language'), 'fr');
    const preferences = TestBed.inject(PreferencesService);

    expect(preferences.language()).toBe('id');
  });

  it('applies the stored theme to the DOM and persists explicit changes', () => {
    const preferences = TestBed.inject(PreferencesService);

    preferences.setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(readString('alecto-theme')).toBe('dark');

    preferences.setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(readString('alecto-theme')).toBe('light');
  });

  it('hydrates the theme from the stored preference', () => {
    writeString('alecto-theme', 'dark');
    const preferences = TestBed.inject(PreferencesService);

    expect(preferences.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('hydrates the expanded sidebar from storage', () => {
    writeString(appKey('sidebar-collapsed'), 'false');
    const preferences = TestBed.inject(PreferencesService);

    expect(preferences.sidebarCollapsed()).toBe(false);
  });

  it('sets the sidebar state explicitly and persists both directions', () => {
    const preferences = TestBed.inject(PreferencesService);

    preferences.setSidebarCollapsed(false);
    expect(preferences.sidebarCollapsed()).toBe(false);
    expect(readString(appKey('sidebar-collapsed'))).toBe('false');

    preferences.setSidebarCollapsed(true);
    expect(preferences.sidebarCollapsed()).toBe(true);
    expect(readString(appKey('sidebar-collapsed'))).toBe('true');
  });

  it('persists the Japanese language', () => {
    const preferences = TestBed.inject(PreferencesService);

    preferences.setLanguage('ja');

    expect(preferences.language()).toBe('ja');
    expect(readString(appKey('language'))).toBe('ja');
  });
});
