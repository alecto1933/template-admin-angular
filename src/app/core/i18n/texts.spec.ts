import { ACTIVITIES, ANNOUNCEMENTS, HOME_TEXTS } from '@/core/i18n/home.texts';
import { LAYOUT_TEXTS, NOTIFICATION_TEXTS } from '@/core/i18n/layout.texts';
import { LOGIN_TEXTS } from '@/core/i18n/login.texts';
import { NOT_FOUND_TEXTS } from '@/core/i18n/not-found.texts';
import { REGISTER_TEXTS } from '@/core/i18n/register.texts';

type LanguageKeyedTexts = Record<'id' | 'en' | 'ja', Record<string, string>>;

describe('i18n texts', () => {
  const keySets: Array<[string, LanguageKeyedTexts]> = [
    ['LOGIN_TEXTS', LOGIN_TEXTS],
    ['REGISTER_TEXTS', REGISTER_TEXTS],
    ['HOME_TEXTS', HOME_TEXTS],
    ['LAYOUT_TEXTS', LAYOUT_TEXTS],
    ['NOT_FOUND_TEXTS', NOT_FOUND_TEXTS],
  ];

  it.each(keySets)('%s has identical keys for id, en, and ja', (_name, texts) => {
    const idKeys = Object.keys(texts.id).sort();
    const enKeys = Object.keys(texts.en).sort();
    const jaKeys = Object.keys(texts.ja).sort();

    expect(idKeys.length).toBeGreaterThan(0);
    expect(enKeys).toEqual(idKeys);
    expect(jaKeys).toEqual(idKeys);
  });

  it.each(keySets)('%s has no empty translations', (_name, texts) => {
    for (const language of ['id', 'en', 'ja'] as const) {
      const entries = Object.entries(texts[language]);
      expect(entries.length).toBeGreaterThan(0);
      for (const [key, value] of entries) {
        expect(typeof value, `${language}.${key}`).toBe('string');
        expect(value.trim().length, `${language}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('provides the profile management layout keys in all three languages', () => {
    const expected = {
      id: {
        navProfileManagement: 'Profil Vendor',
        navProfileOverview: 'Ringkasan',
        navProfileVendor: 'Profil',
        navProfilePic: 'PIC',
        navProfileBank: 'Rekening Bank',
        navProfileTax: 'Pajak',
        navProfileDomicile: 'Domisili',
        pageProfileManagement: 'Profil Vendor',
        remoteErrorTitle: 'Modul profil tidak bisa dimuat',
        remoteErrorMessage:
          'Periksa koneksi Anda lalu coba lagi. Bagian lain aplikasi tetap bisa dipakai.',
        remoteRetry: 'Coba lagi',
      },
      en: {
        navProfileManagement: 'Vendor Profile',
        navProfileOverview: 'Overview',
        navProfileVendor: 'Profile',
        navProfilePic: 'PIC',
        navProfileBank: 'Bank Account',
        navProfileTax: 'Tax',
        navProfileDomicile: 'Domicile',
        pageProfileManagement: 'Vendor Profile',
        remoteErrorTitle: 'Profile module could not be loaded',
        remoteErrorMessage: 'Check your connection and try again. The rest of the app still works.',
        remoteRetry: 'Try again',
      },
      ja: {
        navProfileManagement: 'ベンダープロフィール',
        navProfileOverview: '概要',
        navProfileVendor: 'プロフィール',
        navProfilePic: '担当者',
        navProfileBank: '銀行口座',
        navProfileTax: '税務',
        navProfileDomicile: '所在地',
        pageProfileManagement: 'ベンダープロフィール',
        remoteErrorTitle: 'プロフィールを読み込めません',
        remoteErrorMessage: '接続を確認して再試行してください。他の機能は利用できます。',
        remoteRetry: '再試行',
      },
    } as const;

    for (const language of ['id', 'en', 'ja'] as const) {
      for (const [key, value] of Object.entries(expected[language])) {
        expect(LAYOUT_TEXTS[language][key as keyof (typeof LAYOUT_TEXTS)['id']]).toBe(value);
      }
    }
  });

  it('provides activities in all three languages', () => {
    expect(Object.keys(ACTIVITIES).sort()).toEqual(['en', 'id', 'ja']);
    expect(ACTIVITIES.id.length).toBeGreaterThan(0);
    expect(ACTIVITIES.en.length).toBe(ACTIVITIES.id.length);
    expect(ACTIVITIES.ja.length).toBe(ACTIVITIES.id.length);
  });

  it('provides announcements in all three languages', () => {
    expect(Object.keys(ANNOUNCEMENTS).sort()).toEqual(['en', 'id', 'ja']);
    expect(ANNOUNCEMENTS.id.length).toBeGreaterThan(0);
    expect(ANNOUNCEMENTS.en.length).toBe(ANNOUNCEMENTS.id.length);
    expect(ANNOUNCEMENTS.ja.length).toBe(ANNOUNCEMENTS.id.length);
  });

  it('provides notifications in all three languages', () => {
    expect(Object.keys(NOTIFICATION_TEXTS).sort()).toEqual(['en', 'id', 'ja']);
    expect(NOTIFICATION_TEXTS.id.length).toBeGreaterThan(0);
    expect(NOTIFICATION_TEXTS.en.length).toBe(NOTIFICATION_TEXTS.id.length);
    expect(NOTIFICATION_TEXTS.ja.length).toBe(NOTIFICATION_TEXTS.id.length);
  });
});
