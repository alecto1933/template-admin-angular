import { TestBed } from '@angular/core/testing';
import { appKey, readString } from '@/core/storage';
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
});
