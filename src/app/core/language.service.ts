import { Injectable, signal } from '@angular/core';

export type Language = 'id' | 'en';

/** Shared UI language for pages inside the app shell (currently the home page). */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly lang = signal<Language>('id');

  set(language: Language): void {
    this.lang.set(language);
  }
}
