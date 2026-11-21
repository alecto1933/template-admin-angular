import { computed, inject, Injectable } from '@angular/core';
import { LanguageService } from '@/core/language.service';
import { LayoutTexts, LAYOUT_TEXTS } from '@/core/i18n/layout.texts';
import { Language } from '@/core/i18n/language';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly language = inject(LanguageService);

  readonly lang = this.language.lang;
  readonly layout = computed<LayoutTexts>(() => LAYOUT_TEXTS[this.lang()]);

  setLanguage(language: Language): void {
    this.language.set(language);
  }
}
