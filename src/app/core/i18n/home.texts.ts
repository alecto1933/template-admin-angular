import { IconName } from '@/shared/ui/icon/icons';
import { Language } from '@/core/i18n/language';

export interface ActivityItem {
  title: string;
  description: string;
  time: string;
  icon: IconName;
  toneClasses: string;
}

export interface Announcement {
  title: string;
  category: string;
  date: string;
}

export const HOME_TEXTS = {
  id: {
    welcomeTo: 'Selamat datang di',
    tagline: 'Platform terintegrasi Anda untuk mengelola ekosistem vendor dalam satu tempat.',
    explore: 'Jelajahi Aplikasi Kami',
    quickAccess: 'Applications & Workspaces',
    quickAccessSubtitle: 'Modul superapp Anda dalam satu tempat.',
    recentActivity: 'Aktivitas Terbaru',
    announcements: 'Pengumuman',
    needHelps: 'Butuh Bantuan',
    needHelpsSubtitle: 'Tim dukungan kami siap membantu kendala Anda.',
    contactSupport: 'Hubungi Dukungan',
    comingSoonTitle: 'Segera hadir',
    comingSoonMessage: 'Halaman ini belum tersedia pada demo. Hubungkan ke modul terkait.',
    languageAria: 'Bahasa: Indonesia',
    qaVendorTitle: 'Vendor Profile Management',
    qaVendorDesc: 'Kelola profil vendor, rekening bank, dan dokumen pendukung Anda.',
    qaOrderTitle: 'Purchase Order',
    qaOrderDesc: 'Lihat dan kelola purchase order Anda.',
    qaBillionTitle: 'Billion',
    qaBillionDesc: 'Akses platform Billion untuk aktivitas transaksi.',
    qaBiddingTitle: 'Bidding Auction',
    qaBiddingDesc: 'Ikuti lelang penawaran dan ajukan penawaran terbaik Anda.',
    qaCapaTitle: 'Capa Tracker',
    qaCapaDesc: 'Pantau progres dan status CAPA Anda.',
  },
  en: {
    welcomeTo: 'Welcome to',
    tagline: 'Your integrated platform to manage vendor ecosystem in the one place.',
    explore: 'Explore Our Apps',
    quickAccess: 'Applications & Workspaces',
    quickAccessSubtitle: 'Your superapp modules in one place.',
    recentActivity: 'Recent Activity',
    announcements: 'Announcements',
    needHelps: 'Need Helps',
    needHelpsSubtitle: 'Our support team is ready to help you.',
    contactSupport: 'Contact Support',
    comingSoonTitle: 'Coming soon',
    comingSoonMessage:
      'This page is not available in the demo yet. Connect it to the related module.',
    languageAria: 'Language: English',
    qaVendorTitle: 'Vendor Profile Management',
    qaVendorDesc: 'Manage your vendor profile, bank account, and supporting documents.',
    qaOrderTitle: 'Purchase Order',
    qaOrderDesc: 'View and manage your purchase order.',
    qaBillionTitle: 'Billion',
    qaBillionDesc: 'Access to Billion platform for transaction activities.',
    qaBiddingTitle: 'Bidding Auction',
    qaBiddingDesc: 'Participate in bidding auctions and submit your best offer.',
    qaCapaTitle: 'Capa Tracker',
    qaCapaDesc: 'Track your CAPA progress and status.',
  },
  ja: {
    welcomeTo: 'ようこそ',
    tagline: 'ベンダーエコシステムを一元管理する統合プラットフォームです。',
    explore: 'アプリを見る',
    quickAccess: 'アプリケーションとワークスペース',
    quickAccessSubtitle: 'スーパーアプリのモジュールを一か所に。',
    recentActivity: '最近のアクティビティ',
    announcements: 'お知らせ',
    needHelps: 'お困りですか',
    needHelpsSubtitle: 'サポートチームが対応いたします。',
    contactSupport: 'サポートに連絡',
    comingSoonTitle: '近日公開',
    comingSoonMessage:
      'このページはデモではまだ利用できません。関連モジュールに接続してください。',
    languageAria: '言語: 日本語',
    qaVendorTitle: 'ベンダープロフィール管理',
    qaVendorDesc: 'ベンダープロフィール、銀行口座、サポート書類を管理します。',
    qaOrderTitle: '発注書',
    qaOrderDesc: '発注書の確認と管理ができます。',
    qaBillionTitle: 'Billion',
    qaBillionDesc: '取引アクティビティのためのBillionプラットフォームにアクセスします。',
    qaBiddingTitle: '入札オークション',
    qaBiddingDesc: '入札に参加し、最適な提案を提出します。',
    qaCapaTitle: 'CAPAトラッカー',
    qaCapaDesc: 'CAPAの進捗とステータスを追跡します。',
  },
} as const;

export const ACTIVITIES: Record<Language, ActivityItem[]> = {
  id: [
    {
      title: 'Purchase order #PO-2049 disetujui',
      description: 'PT Sumber Sehat · Rp 12.500.000',
      time: '2 menit lalu',
      icon: 'shopping-cart',
      toneClasses: 'bg-success-soft text-success',
    },
    {
      title: 'Rekening bank terverifikasi',
      description: 'Profil vendor diperbarui',
      time: '35 menit lalu',
      icon: 'circle-check',
      toneClasses: 'bg-primary-soft text-primary',
    },
    {
      title: 'Penawaran lelang menang',
      description: 'Tender Alat Kesehatan Batch 12',
      time: '2 jam lalu',
      icon: 'trending-up',
      toneClasses: 'bg-warning-soft text-warning',
    },
    {
      title: 'Dokumen pendukung diunggah',
      description: 'Surat Keterangan Domisili',
      time: '5 jam lalu',
      icon: 'file-text',
      toneClasses: 'bg-muted text-muted-foreground',
    },
  ],
  en: [
    {
      title: 'Purchase order #PO-2049 approved',
      description: 'PT Sumber Sehat · Rp 12,500,000',
      time: '2 minutes ago',
      icon: 'shopping-cart',
      toneClasses: 'bg-success-soft text-success',
    },
    {
      title: 'Bank account verified',
      description: 'Vendor profile updated',
      time: '35 minutes ago',
      icon: 'circle-check',
      toneClasses: 'bg-primary-soft text-primary',
    },
    {
      title: 'Bidding auction won',
      description: 'Medical Equipment Tender Batch 12',
      time: '2 hours ago',
      icon: 'trending-up',
      toneClasses: 'bg-warning-soft text-warning',
    },
    {
      title: 'Supporting document uploaded',
      description: 'Certificate of Domicile',
      time: '5 hours ago',
      icon: 'file-text',
      toneClasses: 'bg-muted text-muted-foreground',
    },
  ],
  ja: [
    {
      title: '発注書 #PO-2049 が承認されました',
      description: 'PT Sumber Sehat · Rp 12,500,000',
      time: '2分前',
      icon: 'shopping-cart',
      toneClasses: 'bg-success-soft text-success',
    },
    {
      title: '銀行口座が確認されました',
      description: 'ベンダープロフィールを更新しました',
      time: '35分前',
      icon: 'circle-check',
      toneClasses: 'bg-primary-soft text-primary',
    },
    {
      title: '入札に落札しました',
      description: '医療機器入札 バッチ12',
      time: '2時間前',
      icon: 'trending-up',
      toneClasses: 'bg-warning-soft text-warning',
    },
    {
      title: 'サポート書類がアップロードされました',
      description: '居住証明書',
      time: '5時間前',
      icon: 'file-text',
      toneClasses: 'bg-muted text-muted-foreground',
    },
  ],
};

export const ANNOUNCEMENTS: Record<Language, Announcement[]> = {
  id: [
    {
      title: 'Pemeliharaan platform hari Sabtu',
      category: 'Pemeliharaan',
      date: '22 Nov 2026',
    },
    {
      title: 'Modul lelang baru telah aktif',
      category: 'Fitur',
      date: '18 Nov 2026',
    },
    {
      title: 'Pembaruan persyaratan dokumen vendor',
      category: 'Kebijakan',
      date: '12 Nov 2026',
    },
  ],
  en: [
    {
      title: 'Platform maintenance this Saturday',
      category: 'Maintenance',
      date: 'Nov 22, 2026',
    },
    {
      title: 'New bidding auction module is live',
      category: 'Feature',
      date: 'Nov 18, 2026',
    },
    {
      title: 'Updated vendor document requirements',
      category: 'Policy',
      date: 'Nov 12, 2026',
    },
  ],
  ja: [
    {
      title: '土曜日にプラットフォームメンテナンスを実施します',
      category: 'メンテナンス',
      date: '2026年11月22日',
    },
    {
      title: '新しい入札モジュールが公開されました',
      category: '機能',
      date: '2026年11月18日',
    },
    {
      title: 'ベンダー書類要件を更新しました',
      category: 'ポリシー',
      date: '2026年11月12日',
    },
  ],
};

export type HomeTexts = (typeof HOME_TEXTS)[Language];
