import { IconName } from '@/shared/ui/icon/icons';
import { LayoutTextKey } from '@/core/i18n/layout.texts';

export interface NavChild {
  labelKey: LayoutTextKey;
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
      {
        labelKey: 'navProfileManagement',
        path: '/profile-management',
        icon: 'user',
        children: [
          { labelKey: 'navProfileOverview', path: '/profile-management', exact: true },
          { labelKey: 'navProfileVendor', path: '/profile-management/vendor' },
          { labelKey: 'navProfilePic', path: '/profile-management/pic' },
          { labelKey: 'navProfileBank', path: '/profile-management/bank' },
          { labelKey: 'navProfileTax', path: '/profile-management/tax' },
          { labelKey: 'navProfileDomicile', path: '/profile-management/domicile' },
        ],
      },
    ],
  },
];
