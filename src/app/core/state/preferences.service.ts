import { Injectable, signal } from '@angular/core';
import { Language } from '@/core/i18n/language';
import { appKey, readString, writeString } from '@/core/storage';

export type Theme = 'light' | 'dark';

export type { Language };

const THEME_KEY = 'alecto-theme';
const LANGUAGE_KEY = appKey('language');
const SIDEBAR_KEY = appKey('sidebar-collapsed');

function initialTheme(): Theme {
  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  const stored = readString(THEME_KEY);
  return stored === 'dark' || stored === 'light' ? stored : 'light';
}

function initialLanguage(): Language {
  const stored = readString(LANGUAGE_KEY);
  return stored === 'en' || stored === 'ja' ? stored : 'id';
}

function initialSidebarCollapsed(): boolean {
  return readString(SIDEBAR_KEY) !== 'false';
}

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly _theme = signal<Theme>(initialTheme());
  private readonly _language = signal<Language>(initialLanguage());
  private readonly _sidebarCollapsed = signal<boolean>(initialSidebarCollapsed());

  readonly theme = this._theme.asReadonly();
  readonly language = this._language.asReadonly();
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();

  constructor() {
    this.applyTheme(this._theme());
  }

  toggleTheme(): void {
    this.applyTheme(this._theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.applyTheme(theme);
  }

  setLanguage(language: Language): void {
    this._language.set(language);
    writeString(LANGUAGE_KEY, language);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this._sidebarCollapsed.set(collapsed);
    writeString(SIDEBAR_KEY, String(collapsed));
  }

  toggleSidebar(): void {
    this.setSidebarCollapsed(!this._sidebarCollapsed());
  }

  private applyTheme(theme: Theme): void {
    this._theme.set(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    writeString(THEME_KEY, theme);
  }
}
