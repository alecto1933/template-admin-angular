import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Language, LanguageService } from '../../core/language.service';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiIcon } from '../../shared/ui/icon/icon';
import { IconName } from '../../shared/ui/icon/icons';
import { ToastService } from '../../shared/ui/toast/toast.service';

interface QuickAccessItem {
  title: string;
  description: string;
  icon: IconName;
  iconClasses: string;
  chipClasses: string;
  glowClasses: string;
}

interface ActivityItem {
  title: string;
  description: string;
  time: string;
  icon: IconName;
  toneClasses: string;
}

interface Announcement {
  title: string;
  category: string;
  date: string;
}

interface HelpItem {
  title: string;
  description: string;
  icon: IconName;
}

const TEXTS = {
  id: {
    welcomeTo: 'Selamat datang di',
    tagline: 'Platform terintegrasi Anda untuk mengelola ekosistem vendor dalam satu tempat.',
    explore: 'Jelajahi Aplikasi Kami',
    quickAccess: 'Applications & Workspaces',
    quickAccessSubtitle: 'Modul superapp Anda dalam satu tempat.',
    appsLabel: '5 aplikasi',
    recentActivity: 'Aktivitas Terbaru',
    announcements: 'Pengumuman',
    needHelps: 'Butuh Bantuan',
    open: 'Buka',
    comingSoonTitle: 'Segera hadir',
    comingSoonMessage: 'Halaman ini belum tersedia pada demo. Hubungkan ke modul terkait.',
    helpToastTitle: 'Pusat bantuan',
    helpToastMessage: 'Ini demo — hubungkan tautan ini ke kanal bantuan Anda.',
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
    appsLabel: '5 apps',
    recentActivity: 'Recent Activity',
    announcements: 'Announcements',
    needHelps: 'Need Helps',
    open: 'Open',
    comingSoonTitle: 'Coming soon',
    comingSoonMessage:
      'This page is not available in the demo yet. Connect it to the related module.',
    helpToastTitle: 'Help center',
    helpToastMessage: 'This is a demo — connect this link to your support channel.',
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
} as const;

const ACTIVITIES: Record<Language, ActivityItem[]> = {
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
};

const ANNOUNCEMENTS: Record<Language, Announcement[]> = {
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
};

const HELPS: Record<Language, HelpItem[]> = {
  id: [
    { title: 'Pusat Bantuan', description: 'Telusuri panduan dan FAQ', icon: 'life-buoy' },
    { title: 'Hubungi Dukungan', description: 'Chat dengan tim dukungan kami', icon: 'mail' },
    {
      title: 'Panduan Pengguna',
      description: 'Pelajari cara menggunakan platform',
      icon: 'book-open',
    },
  ],
  en: [
    { title: 'Help Center', description: 'Browse guides and FAQs', icon: 'life-buoy' },
    { title: 'Contact Support', description: 'Chat with our support team', icon: 'mail' },
    { title: 'User Guide', description: 'Learn how to use the platform', icon: 'book-open' },
  ],
};

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiBadge, UiIcon],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly toast = inject(ToastService);
  private readonly language = inject(LanguageService);

  protected readonly lang = this.language.lang;
  protected readonly t = computed(() => TEXTS[this.lang()]);
  protected readonly activities = computed(() => ACTIVITIES[this.lang()]);
  protected readonly announcements = computed(() => ANNOUNCEMENTS[this.lang()]);
  protected readonly helps = computed(() => HELPS[this.lang()]);

  protected readonly quickAccess = computed<QuickAccessItem[]>(() => {
    const t = this.t();
    return [
      {
        title: t.qaVendorTitle,
        description: t.qaVendorDesc,
        icon: 'building-2',
        iconClasses: 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-blue-500/30',
        chipClasses: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
        glowClasses: 'bg-sky-500',
      },
      {
        title: t.qaOrderTitle,
        description: t.qaOrderDesc,
        icon: 'shopping-cart',
        iconClasses: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30',
        chipClasses: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
        glowClasses: 'bg-emerald-500',
      },
      {
        title: t.qaBillionTitle,
        description: t.qaBillionDesc,
        icon: 'wallet',
        iconClasses: 'bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-violet-500/30',
        chipClasses: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
        glowClasses: 'bg-violet-500',
      },
      {
        title: t.qaBiddingTitle,
        description: t.qaBiddingDesc,
        icon: 'trending-up',
        iconClasses: 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30',
        chipClasses: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
        glowClasses: 'bg-amber-500',
      },
      {
        title: t.qaCapaTitle,
        description: t.qaCapaDesc,
        icon: 'circle-check',
        iconClasses: 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30',
        chipClasses: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
        glowClasses: 'bg-rose-500',
      },
    ];
  });

  protected scrollToQuickAccess(): void {
    document.getElementById('quick-access')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected openQuickAccess(item: QuickAccessItem): void {
    this.toast.info(this.t().comingSoonTitle, `${item.title} — ${this.t().comingSoonMessage}`);
  }

  protected openHelp(item: HelpItem): void {
    this.toast.info(item.title, this.t().helpToastMessage);
  }
}
