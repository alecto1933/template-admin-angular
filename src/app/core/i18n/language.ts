export type Language = 'id' | 'en' | 'ja';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'id', label: 'Indonesia', flag: 'images/flags/id.svg' },
  { code: 'en', label: 'English', flag: 'images/flags/en.svg' },
  { code: 'ja', label: '日本語', flag: 'images/flags/jp.svg' },
];

export function languageInfo(code: Language): LanguageOption {
  return LANGUAGES.find((item) => item.code === code) ?? LANGUAGES[0];
}
