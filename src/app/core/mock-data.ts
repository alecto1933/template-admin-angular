import { IconName } from '../shared/ui/icon/icons';
import { BadgeVariant } from '../shared/ui/badge/badge';

export type OrderStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export interface Order {
  id: string;
  customer: string;
  email: string;
  initials: string;
  avatarClass: string;
  status: OrderStatus;
  total: number;
  items: number;
  date: string;
  createdAt: string;
}

export const ORDER_STATUS: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  paid: { label: 'Lunas', variant: 'success' },
  pending: { label: 'Menunggu', variant: 'warning' },
  refunded: { label: 'Dikembalikan', variant: 'default' },
  failed: { label: 'Gagal', variant: 'danger' },
};

export const AVATAR_CLASSES = [
  'bg-primary-soft text-primary',
  'bg-success-soft text-success',
  'bg-warning-soft text-warning',
  'bg-destructive-soft text-destructive',
  'bg-chart-2/15 text-chart-2',
  'bg-chart-3/15 text-chart-3',
];

export const ORDERS: Order[] = [
  {
    id: 'INV-2049',
    customer: 'Raka Pratama',
    email: 'raka@alecto.id',
    initials: 'RP',
    avatarClass: AVATAR_CLASSES[0],
    status: 'paid',
    total: 4250000,
    items: 3,
    date: '10 Nov 2026',
    createdAt: '2026-11-10T09:24:00',
  },
  {
    id: 'INV-2048',
    customer: 'Dewi Lestari',
    email: 'dewi.lestari@mail.com',
    initials: 'DL',
    avatarClass: AVATAR_CLASSES[1],
    status: 'pending',
    total: 1899000,
    items: 1,
    date: '10 Nov 2026',
    createdAt: '2026-11-10T08:12:00',
  },
  {
    id: 'INV-2047',
    customer: 'Bagas Saputra',
    email: 'bagas.s@mail.com',
    initials: 'BS',
    avatarClass: AVATAR_CLASSES[2],
    status: 'paid',
    total: 7350000,
    items: 5,
    date: '09 Nov 2026',
    createdAt: '2026-11-09T16:40:00',
  },
  {
    id: 'INV-2046',
    customer: 'Siti Nurhaliza',
    email: 'siti.n@mail.com',
    initials: 'SN',
    avatarClass: AVATAR_CLASSES[3],
    status: 'refunded',
    total: 899000,
    items: 2,
    date: '09 Nov 2026',
    createdAt: '2026-11-09T13:05:00',
  },
  {
    id: 'INV-2045',
    customer: 'Arif Wijaya',
    email: 'arif.w@mail.com',
    initials: 'AW',
    avatarClass: AVATAR_CLASSES[4],
    status: 'failed',
    total: 2499000,
    items: 1,
    date: '08 Nov 2026',
    createdAt: '2026-11-08T19:33:00',
  },
  {
    id: 'INV-2044',
    customer: 'Maya Anggraini',
    email: 'maya.a@mail.com',
    initials: 'MA',
    avatarClass: AVATAR_CLASSES[5],
    status: 'paid',
    total: 1240000,
    items: 2,
    date: '08 Nov 2026',
    createdAt: '2026-11-08T11:18:00',
  },
  {
    id: 'INV-2043',
    customer: 'Fajar Nugroho',
    email: 'fajar.n@mail.com',
    initials: 'FN',
    avatarClass: AVATAR_CLASSES[0],
    status: 'pending',
    total: 5680000,
    items: 4,
    date: '07 Nov 2026',
    createdAt: '2026-11-07T15:51:00',
  },
  {
    id: 'INV-2042',
    customer: 'Nadia Putri',
    email: 'nadia.p@mail.com',
    initials: 'NP',
    avatarClass: AVATAR_CLASSES[1],
    status: 'paid',
    total: 975000,
    items: 1,
    date: '07 Nov 2026',
    createdAt: '2026-11-07T10:02:00',
  },
  {
    id: 'INV-2041',
    customer: 'Hendra Gunawan',
    email: 'hendra.g@mail.com',
    initials: 'HG',
    avatarClass: AVATAR_CLASSES[2],
    status: 'paid',
    total: 3120000,
    items: 3,
    date: '06 Nov 2026',
    createdAt: '2026-11-06T17:44:00',
  },
  {
    id: 'INV-2040',
    customer: 'Intan Permata',
    email: 'intan.p@mail.com',
    initials: 'IP',
    avatarClass: AVATAR_CLASSES[3],
    status: 'refunded',
    total: 1450000,
    items: 2,
    date: '06 Nov 2026',
    createdAt: '2026-11-06T09:27:00',
  },
  {
    id: 'INV-2039',
    customer: 'Yoga Santoso',
    email: 'yoga.s@mail.com',
    initials: 'YS',
    avatarClass: AVATAR_CLASSES[4],
    status: 'paid',
    total: 6480000,
    items: 6,
    date: '05 Nov 2026',
    createdAt: '2026-11-05T14:09:00',
  },
  {
    id: 'INV-2038',
    customer: 'Citra Maharani',
    email: 'citra.m@mail.com',
    initials: 'CM',
    avatarClass: AVATAR_CLASSES[5],
    status: 'pending',
    total: 729000,
    items: 1,
    date: '05 Nov 2026',
    createdAt: '2026-11-05T08:35:00',
  },
  {
    id: 'INV-2037',
    customer: 'Bima Kurniawan',
    email: 'bima.k@mail.com',
    initials: 'BK',
    avatarClass: AVATAR_CLASSES[0],
    status: 'paid',
    total: 2185000,
    items: 2,
    date: '04 Nov 2026',
    createdAt: '2026-11-04T18:22:00',
  },
  {
    id: 'INV-2036',
    customer: 'Laras Ayu',
    email: 'laras.a@mail.com',
    initials: 'LA',
    avatarClass: AVATAR_CLASSES[1],
    status: 'failed',
    total: 455000,
    items: 1,
    date: '04 Nov 2026',
    createdAt: '2026-11-04T12:14:00',
  },
];

export interface DashboardStat {
  label: string;
  value: string;
  delta: number;
  hint: string;
  icon: IconName;
  toneClasses: string;
  chartColor: string;
  sparkline: number[];
}

export const DASHBOARD_STATS: DashboardStat[] = [
  {
    label: 'Total pendapatan',
    value: 'Rp 84,2 jt',
    delta: 12.4,
    hint: 'vs bulan lalu',
    icon: 'wallet',
    toneClasses: 'bg-primary-soft text-primary',
    chartColor: 'var(--chart-1)',
    sparkline: [12, 18, 15, 24, 20, 28, 34, 31, 40, 44, 52, 58],
  },
  {
    label: 'Pesanan',
    value: '1.284',
    delta: 8.2,
    hint: 'vs bulan lalu',
    icon: 'shopping-cart',
    toneClasses: 'bg-chart-2/15 text-chart-2',
    chartColor: 'var(--chart-2)',
    sparkline: [22, 20, 26, 24, 31, 29, 36, 33, 38, 42, 39, 46],
  },
  {
    label: 'Pelanggan baru',
    value: '312',
    delta: 5.1,
    hint: 'vs bulan lalu',
    icon: 'users',
    toneClasses: 'bg-success-soft text-success',
    chartColor: 'var(--chart-3)',
    sparkline: [8, 12, 10, 14, 13, 17, 16, 20, 19, 24, 22, 27],
  },
  {
    label: 'Tingkat konversi',
    value: '3,84%',
    delta: -0.8,
    hint: 'vs bulan lalu',
    icon: 'activity',
    toneClasses: 'bg-warning-soft text-warning',
    chartColor: 'var(--chart-4)',
    sparkline: [32, 30, 34, 29, 31, 27, 30, 26, 28, 24, 26, 23],
  },
];

export type RevenuePeriod = '7d' | '30d' | '12m';

export interface RevenueSeries {
  label: string;
  data: number[];
  labels: string[];
  total: string;
  delta: string;
  note: string;
}

export const REVENUE_BY_PERIOD: Record<RevenuePeriod, RevenueSeries> = {
  '7d': {
    label: '7 hari terakhir',
    data: [9, 14, 11, 18, 16, 24, 21],
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    total: 'Rp 24,8 jt',
    delta: '+8,1%',
    note: 'dari minggu lalu',
  },
  '30d': {
    label: '30 hari terakhir',
    data: [22, 31, 27, 38, 34, 47, 52],
    labels: ['1 Nov', '6 Nov', '11 Nov', '16 Nov', '21 Nov', '26 Nov', '30 Nov'],
    total: 'Rp 84,2 jt',
    delta: '+12,4%',
    note: 'dari bulan lalu',
  },
  '12m': {
    label: '12 bulan terakhir',
    data: [38, 46, 41, 58, 62, 55, 71, 78, 74, 88, 96, 104],
    labels: ['Des', 'Feb', 'Apr', 'Jun', 'Ags', 'Okt', 'Nov'],
    total: 'Rp 812,6 jt',
    delta: '+31,2%',
    note: 'dari tahun lalu',
  },
};

export interface TrafficSegment {
  label: string;
  value: number;
  color: string;
}

export const TRAFFIC_SEGMENTS: TrafficSegment[] = [
  { label: 'Pencarian organik', value: 42, color: 'var(--chart-1)' },
  { label: 'Langsung', value: 28, color: 'var(--chart-2)' },
  { label: 'Media sosial', value: 18, color: 'var(--chart-3)' },
  { label: 'Rujukan', value: 12, color: 'var(--chart-4)' },
];

export interface ActivityItem {
  title: string;
  description: string;
  time: string;
  icon: IconName;
  toneClasses: string;
}

export const ACTIVITIES: ActivityItem[] = [
  {
    title: 'Pembayaran #INV-2049 diterima',
    description: 'Raka Pratama · Rp 4.250.000',
    time: '2 menit lalu',
    icon: 'wallet',
    toneClasses: 'bg-success-soft text-success',
  },
  {
    title: 'Pelanggan baru mendaftar',
    description: 'Intan Permata membuat akun',
    time: '18 menit lalu',
    icon: 'user-plus',
    toneClasses: 'bg-primary-soft text-primary',
  },
  {
    title: 'Stok produk menipis',
    description: 'Kaos iVendor Superapps tersisa 4 unit',
    time: '1 jam lalu',
    icon: 'package',
    toneClasses: 'bg-warning-soft text-warning',
  },
  {
    title: 'Ulasan bintang 5 masuk',
    description: '“Pengiriman cepat, kualitas bagus!”',
    time: '3 jam lalu',
    icon: 'star',
    toneClasses: 'bg-chart-4/15 text-chart-4',
  },
  {
    title: 'Refund diproses',
    description: '#INV-2046 · Rp 899.000',
    time: '5 jam lalu',
    icon: 'refresh-cw',
    toneClasses: 'bg-destructive-soft text-destructive',
  },
];
