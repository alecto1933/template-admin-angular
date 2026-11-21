import { IconName } from '../shared/ui/icon/icons';

export interface NavChild {
  label: string;
  path: string;
  exact?: boolean;
}

export interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  badge?: string;
  exact?: boolean;
  children?: NavChild[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Menu',
    items: [
      {
        label: 'Home',
        path: '/home',
        icon: 'home',
        exact: true,
      },
    ],
  },
];

export interface AppNotification {
  title: string;
  description: string;
  time: string;
  icon: IconName;
  tone: 'primary' | 'success' | 'warning';
}

export const NOTIFICATIONS: AppNotification[] = [
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
];
