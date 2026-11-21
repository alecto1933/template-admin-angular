import { computed, inject, Injectable } from '@angular/core';
import { PreferencesService, Theme } from '../state/preferences.service';

export type { Theme };

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly preferences = inject(PreferencesService);

  readonly theme = this.preferences.theme;
  readonly isDark = computed(() => this.theme() === 'dark');

  toggle(): void {
    this.preferences.toggleTheme();
  }

  set(theme: Theme): void {
    this.preferences.setTheme(theme);
  }
}
