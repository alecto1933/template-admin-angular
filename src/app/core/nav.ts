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
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'layout-dashboard',
        exact: true,
      },
      { label: 'Pesanan', path: '/orders', icon: 'shopping-cart', badge: '8' },
      { label: 'Form', path: '/forms', icon: 'file-text' },
      {
        label: 'Komponen',
        path: '/components',
        icon: 'blocks',
        badge: 'New',
        children: [
          { label: 'Katalog', path: '/components', exact: true },
          { label: 'Accordion', path: '/components/accordion' },
          { label: 'Alert', path: '/components/alert' },
          { label: 'Alert Dialog', path: '/components/alert-dialog' },
          { label: 'Aspect Ratio', path: '/components/aspect-ratio' },
          { label: 'Attachment', path: '/components/attachment' },
          { label: 'Autocomplete', path: '/components/autocomplete' },
          { label: 'Avatar', path: '/components/avatar' },
          { label: 'Badge', path: '/components/badge' },
          { label: 'Breadcrumb', path: '/components/breadcrumb' },
          { label: 'Bubble', path: '/components/bubble' },
          { label: 'Button', path: '/components/button' },
          { label: 'Button Group', path: '/components/button-group' },
          { label: 'Calendar', path: '/components/calendar' },
          { label: 'Card', path: '/components/card' },
          { label: 'Carousel', path: '/components/carousel' },
          { label: 'Checkbox', path: '/components/checkbox' },
          { label: 'Context Menu', path: '/components/context-menu' },
          { label: 'Empty', path: '/components/empty' },
          { label: 'Date Picker', path: '/components/date-picker' },
          { label: 'Field', path: '/components/field' },
          { label: 'Input', path: '/components/input' },
          { label: 'Input Group', path: '/components/input-group' },
          { label: 'Input OTP', path: '/components/input-otp' },
          { label: 'Code Block', path: '/components/code-block' },
          { label: 'Collapsible', path: '/components/collapsible' },
          { label: 'Combobox', path: '/components/combobox' },
          { label: 'Command', path: '/components/command' },
          { label: 'Dialog', path: '/components/dialog' },
          { label: 'Drawer', path: '/components/drawer' },
          { label: 'Dropdown Menu', path: '/components/dropdown-menu' },
          { label: 'Hover Card', path: '/components/hover-card' },
          { label: 'Item', path: '/components/item' },
          { label: 'Kbd', path: '/components/kbd' },
          { label: 'Marker', path: '/components/marker' },
          { label: 'Separator', path: '/components/separator' },
          { label: 'Progress', path: '/components/progress' },
          { label: 'Native Select', path: '/components/native-select' },
          { label: 'Radio Group', path: '/components/radio-group' },
          { label: 'Scroll Area', path: '/components/scroll-area' },
          { label: 'Pagination', path: '/components/pagination' },
          { label: 'Popover', path: '/components/popover' },
          { label: 'Select', path: '/components/select' },
          { label: 'Menubar', path: '/components/menubar' },
          { label: 'Navigation Menu', path: '/components/navigation-menu' },
          { label: 'Message', path: '/components/message' },
          { label: 'Message Scroller', path: '/components/message-scroller' },
          { label: 'Questionnaire', path: '/components/questionnaire' },
          { label: 'Resizable', path: '/components/resizable' },
          { label: 'Skeleton', path: '/components/skeleton' },
          { label: 'Spinner', path: '/components/spinner' },
          { label: 'Sonner', path: '/components/sonner' },
          { label: 'Switch', path: '/components/switch' },
          { label: 'Table', path: '/components/table' },
          { label: 'Textarea', path: '/components/textarea' },
          { label: 'Slider', path: '/components/slider' },
          { label: 'Tabs', path: '/components/tabs' },
          { label: 'Toggle', path: '/components/toggle' },
          { label: 'Toggle Group', path: '/components/toggle-group' },
          { label: 'Tooltip', path: '/components/tooltip' },
          { label: 'Trace', path: '/components/trace' },
        ],
      },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { label: 'Pengaturan', path: '/settings', icon: 'settings' },
      { label: 'Bantuan', path: '/help', icon: 'life-buoy' },
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
    description: 'Produk “Kaos Alecto” tersisa 4 unit.',
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
