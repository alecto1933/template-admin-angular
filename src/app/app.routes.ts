import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth/login',
    title: 'Masuk · iVendor Superapps',
    loadComponent: () => import('./pages/auth/login.page').then((m) => m.LoginPage),
  },
  { path: 'login', redirectTo: 'auth/login' },
  {
    path: 'auth/register',
    title: 'Registrasi Vendor · iVendor Superapps',
    loadComponent: () => import('./pages/auth/register.page').then((m) => m.RegisterPage),
  },
  { path: 'register', redirectTo: 'auth/register' },
  {
    path: '',
    loadComponent: () => import('./layout/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · iVendor Superapps',
        data: { page: 'Dashboard' },
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'orders',
        title: 'Pesanan · iVendor Superapps',
        data: { page: 'Pesanan' },
        loadComponent: () => import('./pages/orders/orders.page').then((m) => m.OrdersPage),
      },
      {
        path: 'forms',
        title: 'Form · iVendor Superapps',
        data: { page: 'Form' },
        loadComponent: () => import('./pages/forms/forms.page').then((m) => m.FormsPage),
      },
      {
        path: 'components',
        title: 'Komponen · iVendor Superapps',
        data: { page: 'Komponen' },
        loadComponent: () =>
          import('./pages/components/components.page').then((m) => m.ComponentsPage),
      },
      {
        path: 'components/accordion',
        title: 'Accordion · iVendor Superapps',
        data: { page: 'Accordion' },
        loadComponent: () =>
          import('./pages/components/accordion.page').then((m) => m.AccordionPage),
      },
      {
        path: 'components/alert',
        title: 'Alert · iVendor Superapps',
        data: { page: 'Alert' },
        loadComponent: () => import('./pages/components/alert.page').then((m) => m.AlertPage),
      },
      {
        path: 'components/alert-dialog',
        title: 'Alert Dialog · iVendor Superapps',
        data: { page: 'Alert Dialog' },
        loadComponent: () =>
          import('./pages/components/alert-dialog.page').then((m) => m.AlertDialogPage),
      },
      {
        path: 'components/aspect-ratio',
        title: 'Aspect Ratio · iVendor Superapps',
        data: { page: 'Aspect Ratio' },
        loadComponent: () =>
          import('./pages/components/aspect-ratio.page').then((m) => m.AspectRatioPage),
      },
      {
        path: 'components/attachment',
        title: 'Attachment · iVendor Superapps',
        data: { page: 'Attachment' },
        loadComponent: () =>
          import('./pages/components/attachment.page').then((m) => m.AttachmentPage),
      },
      {
        path: 'components/autocomplete',
        title: 'Autocomplete · iVendor Superapps',
        data: { page: 'Autocomplete' },
        loadComponent: () =>
          import('./pages/components/autocomplete.page').then((m) => m.AutocompletePage),
      },
      {
        path: 'components/avatar',
        title: 'Avatar · iVendor Superapps',
        data: { page: 'Avatar' },
        loadComponent: () => import('./pages/components/avatar.page').then((m) => m.AvatarPage),
      },
      {
        path: 'components/badge',
        title: 'Badge · iVendor Superapps',
        data: { page: 'Badge' },
        loadComponent: () => import('./pages/components/badge.page').then((m) => m.BadgePage),
      },
      {
        path: 'components/breadcrumb',
        title: 'Breadcrumb · iVendor Superapps',
        data: { page: 'Breadcrumb' },
        loadComponent: () =>
          import('./pages/components/breadcrumb.page').then((m) => m.BreadcrumbPage),
      },
      {
        path: 'components/bubble',
        title: 'Bubble · iVendor Superapps',
        data: { page: 'Bubble' },
        loadComponent: () => import('./pages/components/bubble.page').then((m) => m.BubblePage),
      },
      {
        path: 'components/button',
        title: 'Button · iVendor Superapps',
        data: { page: 'Button' },
        loadComponent: () => import('./pages/components/button.page').then((m) => m.ButtonPage),
      },
      {
        path: 'components/button-group',
        title: 'Button Group · iVendor Superapps',
        data: { page: 'Button Group' },
        loadComponent: () =>
          import('./pages/components/button-group.page').then((m) => m.ButtonGroupPage),
      },
      {
        path: 'components/calendar',
        title: 'Calendar · iVendor Superapps',
        data: { page: 'Calendar' },
        loadComponent: () => import('./pages/components/calendar.page').then((m) => m.CalendarPage),
      },
      {
        path: 'components/card',
        title: 'Card · iVendor Superapps',
        data: { page: 'Card' },
        loadComponent: () => import('./pages/components/card.page').then((m) => m.CardPage),
      },
      {
        path: 'components/carousel',
        title: 'Carousel · iVendor Superapps',
        data: { page: 'Carousel' },
        loadComponent: () => import('./pages/components/carousel.page').then((m) => m.CarouselPage),
      },
      {
        path: 'components/checkbox',
        title: 'Checkbox · iVendor Superapps',
        data: { page: 'Checkbox' },
        loadComponent: () => import('./pages/components/checkbox.page').then((m) => m.CheckboxPage),
      },
      {
        path: 'components/context-menu',
        title: 'Context Menu · iVendor Superapps',
        data: { page: 'Context Menu' },
        loadComponent: () =>
          import('./pages/components/context-menu.page').then((m) => m.ContextMenuPage),
      },
      {
        path: 'components/empty',
        title: 'Empty · iVendor Superapps',
        data: { page: 'Empty' },
        loadComponent: () => import('./pages/components/empty.page').then((m) => m.EmptyPage),
      },
      {
        path: 'components/field',
        title: 'Field · iVendor Superapps',
        data: { page: 'Field' },
        loadComponent: () => import('./pages/components/field.page').then((m) => m.FieldPage),
      },
      {
        path: 'components/input',
        title: 'Input · iVendor Superapps',
        data: { page: 'Input' },
        loadComponent: () => import('./pages/components/input.page').then((m) => m.InputPage),
      },
      {
        path: 'components/input-group',
        title: 'Input Group · iVendor Superapps',
        data: { page: 'Input Group' },
        loadComponent: () =>
          import('./pages/components/input-group.page').then((m) => m.InputGroupPage),
      },
      {
        path: 'components/date-picker',
        title: 'Date Picker · iVendor Superapps',
        data: { page: 'Date Picker' },
        loadComponent: () =>
          import('./pages/components/date-picker.page').then((m) => m.DatePickerPage),
      },
      {
        path: 'components/input-otp',
        title: 'Input OTP · iVendor Superapps',
        data: { page: 'Input OTP' },
        loadComponent: () =>
          import('./pages/components/input-otp.page').then((m) => m.InputOtpPage),
      },
      {
        path: 'components/code-block',
        title: 'Code Block · iVendor Superapps',
        data: { page: 'Code Block' },
        loadComponent: () =>
          import('./pages/components/code-block.page').then((m) => m.CodeBlockPage),
      },
      {
        path: 'components/collapsible',
        title: 'Collapsible · iVendor Superapps',
        data: { page: 'Collapsible' },
        loadComponent: () =>
          import('./pages/components/collapsible.page').then((m) => m.CollapsiblePage),
      },
      {
        path: 'components/combobox',
        title: 'Combobox · iVendor Superapps',
        data: { page: 'Combobox' },
        loadComponent: () => import('./pages/components/combobox.page').then((m) => m.ComboboxPage),
      },
      {
        path: 'components/command',
        title: 'Command · iVendor Superapps',
        data: { page: 'Command' },
        loadComponent: () => import('./pages/components/command.page').then((m) => m.CommandPage),
      },
      {
        path: 'components/dialog',
        title: 'Dialog · iVendor Superapps',
        data: { page: 'Dialog' },
        loadComponent: () => import('./pages/components/dialog.page').then((m) => m.DialogPage),
      },
      {
        path: 'components/drawer',
        title: 'Drawer · iVendor Superapps',
        data: { page: 'Drawer' },
        loadComponent: () => import('./pages/components/drawer.page').then((m) => m.DrawerPage),
      },
      {
        path: 'components/dropdown-menu',
        title: 'Dropdown Menu · iVendor Superapps',
        data: { page: 'Dropdown Menu' },
        loadComponent: () =>
          import('./pages/components/dropdown-menu.page').then((m) => m.DropdownMenuPage),
      },
      {
        path: 'components/hover-card',
        title: 'Hover Card · iVendor Superapps',
        data: { page: 'Hover Card' },
        loadComponent: () =>
          import('./pages/components/hover-card.page').then((m) => m.HoverCardPage),
      },
      {
        path: 'components/item',
        title: 'Item · iVendor Superapps',
        data: { page: 'Item' },
        loadComponent: () => import('./pages/components/item.page').then((m) => m.ItemPage),
      },
      {
        path: 'components/kbd',
        title: 'Kbd · iVendor Superapps',
        data: { page: 'Kbd' },
        loadComponent: () => import('./pages/components/kbd.page').then((m) => m.KbdPage),
      },
      {
        path: 'components/marker',
        title: 'Marker · iVendor Superapps',
        data: { page: 'Marker' },
        loadComponent: () => import('./pages/components/marker.page').then((m) => m.MarkerPage),
      },
      {
        path: 'components/separator',
        title: 'Separator · iVendor Superapps',
        data: { page: 'Separator' },
        loadComponent: () =>
          import('./pages/components/separator.page').then((m) => m.SeparatorPage),
      },
      {
        path: 'components/progress',
        title: 'Progress · iVendor Superapps',
        data: { page: 'Progress' },
        loadComponent: () => import('./pages/components/progress.page').then((m) => m.ProgressPage),
      },
      {
        path: 'components/native-select',
        title: 'Native Select · iVendor Superapps',
        data: { page: 'Native Select' },
        loadComponent: () =>
          import('./pages/components/native-select.page').then((m) => m.NativeSelectPage),
      },
      {
        path: 'components/radio-group',
        title: 'Radio Group · iVendor Superapps',
        data: { page: 'Radio Group' },
        loadComponent: () =>
          import('./pages/components/radio-group.page').then((m) => m.RadioGroupPage),
      },
      {
        path: 'components/scroll-area',
        title: 'Scroll Area · iVendor Superapps',
        data: { page: 'Scroll Area' },
        loadComponent: () =>
          import('./pages/components/scroll-area.page').then((m) => m.ScrollAreaPage),
      },
      {
        path: 'components/pagination',
        title: 'Pagination · iVendor Superapps',
        data: { page: 'Pagination' },
        loadComponent: () =>
          import('./pages/components/pagination.page').then((m) => m.PaginationPage),
      },
      {
        path: 'components/popover',
        title: 'Popover · iVendor Superapps',
        data: { page: 'Popover' },
        loadComponent: () => import('./pages/components/popover.page').then((m) => m.PopoverPage),
      },
      {
        path: 'components/select',
        title: 'Select · iVendor Superapps',
        data: { page: 'Select' },
        loadComponent: () => import('./pages/components/select.page').then((m) => m.SelectPage),
      },
      {
        path: 'components/menubar',
        title: 'Menubar · iVendor Superapps',
        data: { page: 'Menubar' },
        loadComponent: () => import('./pages/components/menubar.page').then((m) => m.MenubarPage),
      },
      {
        path: 'components/navigation-menu',
        title: 'Navigation Menu · iVendor Superapps',
        data: { page: 'Navigation Menu' },
        loadComponent: () =>
          import('./pages/components/navigation-menu.page').then((m) => m.NavigationMenuPage),
      },
      {
        path: 'components/message',
        title: 'Message · iVendor Superapps',
        data: { page: 'Message' },
        loadComponent: () => import('./pages/components/message.page').then((m) => m.MessagePage),
      },
      {
        path: 'components/message-scroller',
        title: 'Message Scroller · iVendor Superapps',
        data: { page: 'Message Scroller' },
        loadComponent: () =>
          import('./pages/components/message-scroller.page').then((m) => m.MessageScrollerPage),
      },
      {
        path: 'components/questionnaire',
        title: 'Questionnaire · iVendor Superapps',
        data: { page: 'Questionnaire' },
        loadComponent: () =>
          import('./pages/components/questionnaire.page').then((m) => m.QuestionnairePage),
      },
      {
        path: 'components/resizable',
        title: 'Resizable · iVendor Superapps',
        data: { page: 'Resizable' },
        loadComponent: () =>
          import('./pages/components/resizable.page').then((m) => m.ResizablePage),
      },
      {
        path: 'components/skeleton',
        title: 'Skeleton · iVendor Superapps',
        data: { page: 'Skeleton' },
        loadComponent: () => import('./pages/components/skeleton.page').then((m) => m.SkeletonPage),
      },
      {
        path: 'components/spinner',
        title: 'Spinner · iVendor Superapps',
        data: { page: 'Spinner' },
        loadComponent: () => import('./pages/components/spinner.page').then((m) => m.SpinnerPage),
      },
      {
        path: 'components/sonner',
        title: 'Sonner · iVendor Superapps',
        data: { page: 'Sonner' },
        loadComponent: () => import('./pages/components/sonner.page').then((m) => m.SonnerPage),
      },
      {
        path: 'components/switch',
        title: 'Switch · iVendor Superapps',
        data: { page: 'Switch' },
        loadComponent: () => import('./pages/components/switch.page').then((m) => m.SwitchPage),
      },
      {
        path: 'components/table',
        title: 'Table · iVendor Superapps',
        data: { page: 'Table' },
        loadComponent: () => import('./pages/components/table.page').then((m) => m.TablePage),
      },
      {
        path: 'components/textarea',
        title: 'Textarea · iVendor Superapps',
        data: { page: 'Textarea' },
        loadComponent: () => import('./pages/components/textarea.page').then((m) => m.TextareaPage),
      },
      {
        path: 'components/slider',
        title: 'Slider · iVendor Superapps',
        data: { page: 'Slider' },
        loadComponent: () => import('./pages/components/slider.page').then((m) => m.SliderPage),
      },
      {
        path: 'components/tabs',
        title: 'Tabs · iVendor Superapps',
        data: { page: 'Tabs' },
        loadComponent: () => import('./pages/components/tabs.page').then((m) => m.TabsPage),
      },
      {
        path: 'components/toggle',
        title: 'Toggle · iVendor Superapps',
        data: { page: 'Toggle' },
        loadComponent: () => import('./pages/components/toggle.page').then((m) => m.TogglePage),
      },
      {
        path: 'components/toggle-group',
        title: 'Toggle Group · iVendor Superapps',
        data: { page: 'Toggle Group' },
        loadComponent: () =>
          import('./pages/components/toggle-group.page').then((m) => m.ToggleGroupPage),
      },
      {
        path: 'components/tooltip',
        title: 'Tooltip · iVendor Superapps',
        data: { page: 'Tooltip' },
        loadComponent: () => import('./pages/components/tooltip.page').then((m) => m.TooltipPage),
      },
      {
        path: 'components/trace',
        title: 'Trace · iVendor Superapps',
        data: { page: 'Trace' },
        loadComponent: () => import('./pages/components/trace.page').then((m) => m.TracePage),
      },
      {
        path: 'settings',
        title: 'Pengaturan · iVendor Superapps',
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
