import { IconName } from '../shared/ui/icon/icons';
import { LayoutTextKey } from './i18n/layout.texts';

export interface NavChild {
  label: string;
  path: string;
  exact?: boolean;
}

export interface NavItem {
  labelKey: LayoutTextKey;
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
        labelKey: 'navHome',
        path: '/home',
        icon: 'home',
        exact: true,
      },
    ],
  },
];
