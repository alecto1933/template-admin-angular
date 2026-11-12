import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth/login',
    title: 'Masuk · Alecto',
    loadComponent: () => import('./pages/auth/login.page').then((m) => m.LoginPage),
  },
  { path: 'login', redirectTo: 'auth/login' },
  {
    path: '',
    loadComponent: () => import('./layout/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · Alecto',
        data: { page: 'Dashboard' },
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'orders',
        title: 'Pesanan · Alecto',
        data: { page: 'Pesanan' },
        loadComponent: () => import('./pages/orders/orders.page').then((m) => m.OrdersPage),
      },
      {
        path: 'forms',
        title: 'Form · Alecto',
        data: { page: 'Form' },
        loadComponent: () => import('./pages/forms/forms.page').then((m) => m.FormsPage),
      },
      {
        path: 'components',
        title: 'Komponen · Alecto',
        data: { page: 'Komponen' },
        loadComponent: () =>
          import('./pages/components/components.page').then((m) => m.ComponentsPage),
      },
      {
        path: 'components/accordion',
        title: 'Accordion · Alecto',
        data: { page: 'Accordion' },
        loadComponent: () =>
          import('./pages/components/accordion.page').then((m) => m.AccordionPage),
      },
      {
        path: 'components/alert',
        title: 'Alert · Alecto',
        data: { page: 'Alert' },
        loadComponent: () => import('./pages/components/alert.page').then((m) => m.AlertPage),
      },
      {
        path: 'components/alert-dialog',
        title: 'Alert Dialog · Alecto',
        data: { page: 'Alert Dialog' },
        loadComponent: () =>
          import('./pages/components/alert-dialog.page').then((m) => m.AlertDialogPage),
      },
      {
        path: 'components/aspect-ratio',
        title: 'Aspect Ratio · Alecto',
        data: { page: 'Aspect Ratio' },
        loadComponent: () =>
          import('./pages/components/aspect-ratio.page').then((m) => m.AspectRatioPage),
      },
      {
        path: 'components/attachment',
        title: 'Attachment · Alecto',
        data: { page: 'Attachment' },
        loadComponent: () =>
          import('./pages/components/attachment.page').then((m) => m.AttachmentPage),
      },
      {
        path: 'components/autocomplete',
        title: 'Autocomplete · Alecto',
        data: { page: 'Autocomplete' },
        loadComponent: () =>
          import('./pages/components/autocomplete.page').then((m) => m.AutocompletePage),
      },
      {
        path: 'components/avatar',
        title: 'Avatar · Alecto',
        data: { page: 'Avatar' },
        loadComponent: () => import('./pages/components/avatar.page').then((m) => m.AvatarPage),
      },
      {
        path: 'components/badge',
        title: 'Badge · Alecto',
        data: { page: 'Badge' },
        loadComponent: () => import('./pages/components/badge.page').then((m) => m.BadgePage),
      },
      {
        path: 'components/breadcrumb',
        title: 'Breadcrumb · Alecto',
        data: { page: 'Breadcrumb' },
        loadComponent: () =>
          import('./pages/components/breadcrumb.page').then((m) => m.BreadcrumbPage),
      },
      {
        path: 'components/bubble',
        title: 'Bubble · Alecto',
        data: { page: 'Bubble' },
        loadComponent: () => import('./pages/components/bubble.page').then((m) => m.BubblePage),
      },
      {
        path: 'components/button',
        title: 'Button · Alecto',
        data: { page: 'Button' },
        loadComponent: () => import('./pages/components/button.page').then((m) => m.ButtonPage),
      },
      {
        path: 'components/button-group',
        title: 'Button Group · Alecto',
        data: { page: 'Button Group' },
        loadComponent: () =>
          import('./pages/components/button-group.page').then((m) => m.ButtonGroupPage),
      },
      {
        path: 'components/calendar',
        title: 'Calendar · Alecto',
        data: { page: 'Calendar' },
        loadComponent: () => import('./pages/components/calendar.page').then((m) => m.CalendarPage),
      },
      {
        path: 'components/card',
        title: 'Card · Alecto',
        data: { page: 'Card' },
        loadComponent: () => import('./pages/components/card.page').then((m) => m.CardPage),
      },
      {
        path: 'components/carousel',
        title: 'Carousel · Alecto',
        data: { page: 'Carousel' },
        loadComponent: () => import('./pages/components/carousel.page').then((m) => m.CarouselPage),
      },
      {
        path: 'components/checkbox',
        title: 'Checkbox · Alecto',
        data: { page: 'Checkbox' },
        loadComponent: () => import('./pages/components/checkbox.page').then((m) => m.CheckboxPage),
      },
      {
        path: 'components/context-menu',
        title: 'Context Menu · Alecto',
        data: { page: 'Context Menu' },
        loadComponent: () =>
          import('./pages/components/context-menu.page').then((m) => m.ContextMenuPage),
      },
      {
        path: 'components/empty',
        title: 'Empty · Alecto',
        data: { page: 'Empty' },
        loadComponent: () => import('./pages/components/empty.page').then((m) => m.EmptyPage),
      },
      {
        path: 'components/field',
        title: 'Field · Alecto',
        data: { page: 'Field' },
        loadComponent: () => import('./pages/components/field.page').then((m) => m.FieldPage),
      },
      {
        path: 'components/input',
        title: 'Input · Alecto',
        data: { page: 'Input' },
        loadComponent: () => import('./pages/components/input.page').then((m) => m.InputPage),
      },
      {
        path: 'components/input-group',
        title: 'Input Group · Alecto',
        data: { page: 'Input Group' },
        loadComponent: () =>
          import('./pages/components/input-group.page').then((m) => m.InputGroupPage),
      },
      {
        path: 'components/date-picker',
        title: 'Date Picker · Alecto',
        data: { page: 'Date Picker' },
        loadComponent: () =>
          import('./pages/components/date-picker.page').then((m) => m.DatePickerPage),
      },
      {
        path: 'components/input-otp',
        title: 'Input OTP · Alecto',
        data: { page: 'Input OTP' },
        loadComponent: () =>
          import('./pages/components/input-otp.page').then((m) => m.InputOtpPage),
      },
      {
        path: 'components/code-block',
        title: 'Code Block · Alecto',
        data: { page: 'Code Block' },
        loadComponent: () =>
          import('./pages/components/code-block.page').then((m) => m.CodeBlockPage),
      },
      {
        path: 'components/collapsible',
        title: 'Collapsible · Alecto',
        data: { page: 'Collapsible' },
        loadComponent: () =>
          import('./pages/components/collapsible.page').then((m) => m.CollapsiblePage),
      },
      {
        path: 'components/combobox',
        title: 'Combobox · Alecto',
        data: { page: 'Combobox' },
        loadComponent: () => import('./pages/components/combobox.page').then((m) => m.ComboboxPage),
      },
      {
        path: 'components/command',
        title: 'Command · Alecto',
        data: { page: 'Command' },
        loadComponent: () => import('./pages/components/command.page').then((m) => m.CommandPage),
      },
      {
        path: 'components/dialog',
        title: 'Dialog · Alecto',
        data: { page: 'Dialog' },
        loadComponent: () => import('./pages/components/dialog.page').then((m) => m.DialogPage),
      },
      {
        path: 'components/drawer',
        title: 'Drawer · Alecto',
        data: { page: 'Drawer' },
        loadComponent: () => import('./pages/components/drawer.page').then((m) => m.DrawerPage),
      },
      {
        path: 'components/dropdown-menu',
        title: 'Dropdown Menu · Alecto',
        data: { page: 'Dropdown Menu' },
        loadComponent: () =>
          import('./pages/components/dropdown-menu.page').then((m) => m.DropdownMenuPage),
      },
      {
        path: 'components/hover-card',
        title: 'Hover Card · Alecto',
        data: { page: 'Hover Card' },
        loadComponent: () =>
          import('./pages/components/hover-card.page').then((m) => m.HoverCardPage),
      },
      {
        path: 'components/item',
        title: 'Item · Alecto',
        data: { page: 'Item' },
        loadComponent: () => import('./pages/components/item.page').then((m) => m.ItemPage),
      },
      {
        path: 'components/kbd',
        title: 'Kbd · Alecto',
        data: { page: 'Kbd' },
        loadComponent: () => import('./pages/components/kbd.page').then((m) => m.KbdPage),
      },
      {
        path: 'components/marker',
        title: 'Marker · Alecto',
        data: { page: 'Marker' },
        loadComponent: () => import('./pages/components/marker.page').then((m) => m.MarkerPage),
      },
      {
        path: 'components/separator',
        title: 'Separator · Alecto',
        data: { page: 'Separator' },
        loadComponent: () =>
          import('./pages/components/separator.page').then((m) => m.SeparatorPage),
      },
      {
        path: 'components/progress',
        title: 'Progress · Alecto',
        data: { page: 'Progress' },
        loadComponent: () => import('./pages/components/progress.page').then((m) => m.ProgressPage),
      },
      {
        path: 'components/native-select',
        title: 'Native Select · Alecto',
        data: { page: 'Native Select' },
        loadComponent: () =>
          import('./pages/components/native-select.page').then((m) => m.NativeSelectPage),
      },
      {
        path: 'components/radio-group',
        title: 'Radio Group · Alecto',
        data: { page: 'Radio Group' },
        loadComponent: () =>
          import('./pages/components/radio-group.page').then((m) => m.RadioGroupPage),
      },
      {
        path: 'components/scroll-area',
        title: 'Scroll Area · Alecto',
        data: { page: 'Scroll Area' },
        loadComponent: () =>
          import('./pages/components/scroll-area.page').then((m) => m.ScrollAreaPage),
      },
      {
        path: 'components/pagination',
        title: 'Pagination · Alecto',
        data: { page: 'Pagination' },
        loadComponent: () =>
          import('./pages/components/pagination.page').then((m) => m.PaginationPage),
      },
      {
        path: 'components/popover',
        title: 'Popover · Alecto',
        data: { page: 'Popover' },
        loadComponent: () => import('./pages/components/popover.page').then((m) => m.PopoverPage),
      },
      {
        path: 'components/select',
        title: 'Select · Alecto',
        data: { page: 'Select' },
        loadComponent: () => import('./pages/components/select.page').then((m) => m.SelectPage),
      },
      {
        path: 'components/menubar',
        title: 'Menubar · Alecto',
        data: { page: 'Menubar' },
        loadComponent: () => import('./pages/components/menubar.page').then((m) => m.MenubarPage),
      },
      {
        path: 'components/navigation-menu',
        title: 'Navigation Menu · Alecto',
        data: { page: 'Navigation Menu' },
        loadComponent: () =>
          import('./pages/components/navigation-menu.page').then((m) => m.NavigationMenuPage),
      },
      {
        path: 'components/message',
        title: 'Message · Alecto',
        data: { page: 'Message' },
        loadComponent: () => import('./pages/components/message.page').then((m) => m.MessagePage),
      },
      {
        path: 'components/message-scroller',
        title: 'Message Scroller · Alecto',
        data: { page: 'Message Scroller' },
        loadComponent: () =>
          import('./pages/components/message-scroller.page').then((m) => m.MessageScrollerPage),
      },
      {
        path: 'components/questionnaire',
        title: 'Questionnaire · Alecto',
        data: { page: 'Questionnaire' },
        loadComponent: () =>
          import('./pages/components/questionnaire.page').then((m) => m.QuestionnairePage),
      },
      {
        path: 'components/resizable',
        title: 'Resizable · Alecto',
        data: { page: 'Resizable' },
        loadComponent: () =>
          import('./pages/components/resizable.page').then((m) => m.ResizablePage),
      },
      {
        path: 'components/skeleton',
        title: 'Skeleton · Alecto',
        data: { page: 'Skeleton' },
        loadComponent: () => import('./pages/components/skeleton.page').then((m) => m.SkeletonPage),
      },
      {
        path: 'components/spinner',
        title: 'Spinner · Alecto',
        data: { page: 'Spinner' },
        loadComponent: () => import('./pages/components/spinner.page').then((m) => m.SpinnerPage),
      },
      {
        path: 'components/sonner',
        title: 'Sonner · Alecto',
        data: { page: 'Sonner' },
        loadComponent: () => import('./pages/components/sonner.page').then((m) => m.SonnerPage),
      },
      {
        path: 'components/switch',
        title: 'Switch · Alecto',
        data: { page: 'Switch' },
        loadComponent: () => import('./pages/components/switch.page').then((m) => m.SwitchPage),
      },
      {
        path: 'components/table',
        title: 'Table · Alecto',
        data: { page: 'Table' },
        loadComponent: () => import('./pages/components/table.page').then((m) => m.TablePage),
      },
      {
        path: 'components/textarea',
        title: 'Textarea · Alecto',
        data: { page: 'Textarea' },
        loadComponent: () => import('./pages/components/textarea.page').then((m) => m.TextareaPage),
      },
      {
        path: 'components/slider',
        title: 'Slider · Alecto',
        data: { page: 'Slider' },
        loadComponent: () => import('./pages/components/slider.page').then((m) => m.SliderPage),
      },
      {
        path: 'components/tabs',
        title: 'Tabs · Alecto',
        data: { page: 'Tabs' },
        loadComponent: () => import('./pages/components/tabs.page').then((m) => m.TabsPage),
      },
      {
        path: 'components/toggle',
        title: 'Toggle · Alecto',
        data: { page: 'Toggle' },
        loadComponent: () => import('./pages/components/toggle.page').then((m) => m.TogglePage),
      },
      {
        path: 'components/toggle-group',
        title: 'Toggle Group · Alecto',
        data: { page: 'Toggle Group' },
        loadComponent: () =>
          import('./pages/components/toggle-group.page').then((m) => m.ToggleGroupPage),
      },
      {
        path: 'components/tooltip',
        title: 'Tooltip · Alecto',
        data: { page: 'Tooltip' },
        loadComponent: () => import('./pages/components/tooltip.page').then((m) => m.TooltipPage),
      },
      {
        path: 'components/trace',
        title: 'Trace · Alecto',
        data: { page: 'Trace' },
        loadComponent: () => import('./pages/components/trace.page').then((m) => m.TracePage),
      },
      {
        path: 'settings',
        title: 'Pengaturan · Alecto',
        data: { page: 'Pengaturan' },
        loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
