import { inject, Injectable } from '@angular/core';
import { Language, PreferencesService } from '@/core/state/preferences.service';

export type { Language };

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly preferences = inject(PreferencesService);

  readonly lang = this.preferences.language;

  set(language: Language): void {
    this.preferences.setLanguage(language);
  }
}
