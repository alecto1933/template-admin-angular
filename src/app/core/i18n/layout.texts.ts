import { IconName } from '../../shared/ui/icon/icons';
import { Language } from './language';

export interface AppNotification {
  title: string;
  description: string;
  time: string;
  icon: IconName;
  tone: 'primary' | 'success' | 'warning';
}

export const LAYOUT_TEXTS = {
  id: {
    skipToContent: 'Lewati ke konten utama',
    navMenu: 'Menu',
    navHome: 'Home',
    sidebarAria: 'Navigasi utama',
    brandHomeAria: 'iVendor Superapps — ke home',
    closeMenu: 'Tutup menu',
    toggleNavigation: 'Buka atau tutup navigasi',
    notifications: 'Notifikasi',
    userMenu: 'Menu pengguna',
    guest: 'Tamu',
    help: 'Bantuan',
    lightMode: 'Mode terang',
    darkMode: 'Mode gelap',
    logout: 'Keluar',
    logoutTitle: 'Keluar dari aplikasi?',
    logoutDescription: 'Sesi Anda akan diakhiri dan Anda perlu masuk kembali untuk melanjutkan.',
    confirmLogout: 'Ya, keluar',
    cancel: 'Batal',
    newNotifications: 'baru',
    viewAllNotifications: 'Lihat semua notifikasi',
    notificationsToast:
      'Halaman daftar notifikasi bisa ditambahkan sesuai kebutuhan aplikasi Anda.',
    helpToastTitle: 'Bantuan',
    helpToastMessage:
      'Buka kartu “Butuh Bantuan” di halaman Home untuk menghubungi tim dukungan.',
    logoutSuccessTitle: 'Berhasil keluar',
    logoutSuccessMessage: 'Sesi demo telah diakhiri.',
    pageHome: 'Home',
  },
  en: {
    skipToContent: 'Skip to main content',
    navMenu: 'Menu',
    navHome: 'Home',
    sidebarAria: 'Main navigation',
    brandHomeAria: 'iVendor Superapps — go to home',
    closeMenu: 'Close menu',
    toggleNavigation: 'Open or close navigation',
    notifications: 'Notifications',
    userMenu: 'User menu',
    guest: 'Guest',
    help: 'Help',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    logout: 'Sign out',
    logoutTitle: 'Sign out of the app?',
    logoutDescription: 'Your session will end and you will need to sign in again to continue.',
    confirmLogout: 'Yes, sign out',
    cancel: 'Cancel',
    newNotifications: 'new',
    viewAllNotifications: 'View all notifications',
    notificationsToast: 'A notifications page can be added based on your app needs.',
    helpToastTitle: 'Help',
    helpToastMessage: 'Open the “Need Helps” card on the Home page to contact the support team.',
    logoutSuccessTitle: 'Signed out',
    logoutSuccessMessage: 'The demo session has ended.',
    pageHome: 'Home',
  },
  ja: {
    skipToContent: 'メインコンテンツへスキップ',
    navMenu: 'メニュー',
    navHome: 'ホーム',
    sidebarAria: 'メインナビゲーション',
    brandHomeAria: 'iVendor Superapps — ホームへ',
    closeMenu: 'メニューを閉じる',
    toggleNavigation: 'ナビゲーションの開閉',
    notifications: '通知',
    userMenu: 'ユーザーメニュー',
    guest: 'ゲスト',
    help: 'ヘルプ',
    lightMode: 'ライトモード',
    darkMode: 'ダークモード',
    logout: 'ログアウト',
    logoutTitle: 'アプリからログアウトしますか？',
    logoutDescription: 'セッションが終了し、続行するには再度ログインが必要です。',
    confirmLogout: 'はい、ログアウト',
    cancel: 'キャンセル',
    newNotifications: '件の新着',
    viewAllNotifications: 'すべての通知を表示',
    notificationsToast: '通知一覧ページは必要に応じて追加できます。',
    helpToastTitle: 'ヘルプ',
    helpToastMessage:
      'ホームページの「お困りですか」カードからサポートチームにご連絡ください。',
    logoutSuccessTitle: 'ログアウトしました',
    logoutSuccessMessage: 'デモセッションを終了しました。',
    pageHome: 'ホーム',
  },
} as const;

export type LayoutTextKey = keyof (typeof LAYOUT_TEXTS)['id'];

export const NOTIFICATION_TEXTS: Record<Language, AppNotification[]> = {
  id: [
    {
      title: 'Pembayaran diterima',
      description: 'Invoice #INV-2049 sebesar Rp 4.250.000 telah lunas.',
      time: '2 menit lalu',
      icon: 'wallet',
      tone: 'success',
    },
    {
      title: 'Stok hampir habis',
      description: 'Produk “Kaos iVendor Superapps” tersisa 4 unit.',
      time: '1 jam lalu',
      icon: 'package',
      tone: 'warning',
    },
    {
      title: 'Anggota baru bergabung',
      description: 'Dewi Lestari menerima undangan tim.',
      time: '3 jam lalu',
      icon: 'user-plus',
      tone: 'primary',
    },
  ],
  en: [
    {
      title: 'Payment received',
      description: 'Invoice #INV-2049 for Rp 4,250,000 has been paid.',
      time: '2 minutes ago',
      icon: 'wallet',
      tone: 'success',
    },
    {
      title: 'Low stock',
      description: '“iVendor Superapps Tee” has only 4 units left.',
      time: '1 hour ago',
      icon: 'package',
      tone: 'warning',
    },
    {
      title: 'New member joined',
      description: 'Dewi Lestari accepted the team invitation.',
      time: '3 hours ago',
      icon: 'user-plus',
      tone: 'primary',
    },
  ],
  ja: [
    {
      title: 'お支払いを受領しました',
      description: '請求書 #INV-2049（Rp 4,250,000）が支払済みになりました。',
      time: '2分前',
      icon: 'wallet',
      tone: 'success',
    },
    {
      title: '在庫がわずかです',
      description: '「Kaos iVendor Superapps」の在庫が残り4点です。',
      time: '1時間前',
      icon: 'package',
      tone: 'warning',
    },
    {
      title: '新しいメンバーが参加しました',
      description: 'Dewi Lestari がチーム招待を承認しました。',
      time: '3時間前',
      icon: 'user-plus',
      tone: 'primary',
    },
  ],
};

export type LayoutTexts = (typeof LAYOUT_TEXTS)[Language];
