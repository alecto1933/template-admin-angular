import { computed, inject, Injectable } from '@angular/core';
import { LanguageService } from '../language.service';
import { LayoutTexts, LAYOUT_TEXTS } from './layout.texts';
import { Language } from './language';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly language = inject(LanguageService);

  readonly lang = this.language.lang;
  readonly layout = computed<LayoutTexts>(() => LAYOUT_TEXTS[this.lang()]);

  setLanguage(language: Language): void {
    this.language.set(language);
  }
}
