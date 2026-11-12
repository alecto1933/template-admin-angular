import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NOTIFICATIONS, AppNotification } from '../core/nav';
import { ThemeService } from '../core/theme/theme.service';
import { UiIcon } from '../shared/ui/icon/icon';
import { ToastService } from '../shared/ui/toast/toast.service';

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon, CdkMenu, CdkMenuItem, CdkMenuTrigger],
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  template: `
    <header class="relative z-30 border-b border-sidebar-border bg-sidebar">
      <div class="flex h-16 items-center gap-3 px-4 md:px-6 lg:px-8">
        <button
          type="button"
          class="grid size-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          (click)="toggleNavigation.emit()"
          aria-label="Buka atau tutup navigasi"
          title="Buka atau tutup navigasi"
        >
          <ui-icon name="menu" class="size-5" />
        </button>

        <div class="flex min-w-0 flex-col">
          <span
            class="truncate font-display text-[13px] font-semibold tracking-tight text-foreground sm:text-sm"
          >
            {{ pageTitle() }}
          </span>
        </div>

        <div class="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div class="relative hidden md:block">
            <ui-icon
              name="search"
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              #searchInput
              uiInput
              type="search"
              class="h-9 w-56 rounded-xl border-transparent bg-muted/70 pr-14 pl-9 text-[13px] focus:bg-card lg:w-72"
              placeholder="Cari apa saja..."
              aria-label="Pencarian global"
              [value]="searchTerm()"
              (input)="searchTerm.set($any($event.target).value)"
              (keydown.enter)="submitSearch()"
            />
            <kbd
              class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground"
            >
              ⌘K
            </kbd>
          </div>

          <button
            type="button"
            class="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            (click)="theme.toggle()"
            [attr.aria-label]="theme.isDark() ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
            [attr.title]="theme.isDark() ? 'Mode terang' : 'Mode gelap'"
          >
            <ui-icon [name]="theme.isDark() ? 'sun' : 'moon'" class="size-[18px]" />
          </button>

          <button
            type="button"
            class="relative grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            [cdkMenuTriggerFor]="notificationsMenu"
            aria-label="Notifikasi"
          >
            <ui-icon name="bell" class="size-[18px]" />
            <span
              class="absolute top-2.5 right-2.5 size-2 rounded-full bg-destructive ring-2 ring-sidebar"
            ></span>
          </button>

          <div class="mx-1 hidden h-6 w-px bg-border sm:block"></div>

          <button
            type="button"
            class="flex items-center gap-2 rounded-xl p-1 pr-1.5 transition-colors hover:bg-accent sm:pr-2"
            [cdkMenuTriggerFor]="userMenu"
            aria-label="Menu pengguna"
          >
            <span
              class="grid size-8 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground"
            >
              RP
            </span>
            <span class="hidden text-left md:block">
              <span class="block text-[13px] leading-tight font-semibold"> Raka Pratama </span>
              <span class="block text-[11px] leading-tight text-muted-foreground"> Admin </span>
            </span>
            <ui-icon name="chevron-down" class="hidden size-3.5 text-muted-foreground md:block" />
          </button>
        </div>
      </div>

      <ng-template #notificationsMenu>
        <div cdkMenu class="ui-menu-panel w-80">
          <div class="flex items-center justify-between px-3 py-2">
            <p class="text-sm font-semibold text-foreground">Notifikasi</p>
            <span
              class="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary"
            >
              {{ notifications.length }} baru
            </span>
          </div>
          <div class="ui-menu-separator"></div>

          @for (notification of notifications; track notification.title) {
            <button
              cdkMenuItem
              type="button"
              class="ui-menu-item items-start py-2.5"
              (click)="openNotification(notification)"
            >
              <span
                class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg"
                [class]="notificationTone(notification.tone)"
              >
                <ui-icon [name]="notification.icon" class="size-4" />
              </span>
              <span class="min-w-0">
                <span class="block text-[13px] font-semibold text-foreground">
                  {{ notification.title }}
                </span>
                <span class="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {{ notification.description }}
                </span>
                <span class="mt-1 block text-[10px] text-muted-foreground/80">
                  {{ notification.time }}
                </span>
              </span>
            </button>
          }

          <div class="ui-menu-separator"></div>
          <button
            cdkMenuItem
            type="button"
            class="ui-menu-item justify-center text-[13px] font-semibold text-primary"
            (click)="allNotifications()"
          >
            Lihat semua notifikasi
          </button>
        </div>
      </ng-template>

      <ng-template #userMenu>
        <div cdkMenu class="ui-menu-panel w-60">
          <div class="px-3 py-2">
            <p class="text-sm font-semibold text-foreground">Raka Pratama</p>
            <p class="truncate text-xs text-muted-foreground">raka&#64;alecto.id</p>
          </div>
          <div class="ui-menu-separator"></div>
          <button cdkMenuItem type="button" class="ui-menu-item" (click)="goToProfile()">
            <ui-icon name="user" class="size-4 text-muted-foreground" />
            Profil saya
          </button>
          <button cdkMenuItem type="button" class="ui-menu-item" (click)="goToSettings()">
            <ui-icon name="settings" class="size-4 text-muted-foreground" />
            Pengaturan
          </button>
          <button cdkMenuItem type="button" class="ui-menu-item" (click)="showHelp()">
            <ui-icon name="circle-help" class="size-4 text-muted-foreground" />
            Bantuan
            <span class="ui-shortcut">?</span>
          </button>
          <div class="ui-menu-separator"></div>
          <button cdkMenuItem type="button" class="ui-menu-item is-destructive" (click)="logout()">
            <ui-icon name="log-out" class="size-4" />
            Keluar
          </button>
        </div>
      </ng-template>
    </header>
  `,
})
export class AppTopbar {
  readonly toggleNavigation = output<void>();

  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly notifications = NOTIFICATIONS;
  protected readonly pageTitle = signal('Dashboard');
  protected readonly searchTerm = signal('');

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    this.router.events
      .pipe(
        startWith(null),
        filter((event) => event === null || event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.refreshPageTitle());
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchInput()?.nativeElement.focus();
    }
  }

  protected submitSearch(): void {
    const term = this.searchTerm().trim();
    if (!term) {
      this.searchInput()?.nativeElement.focus();
      return;
    }
    this.router.navigate(['/orders'], { queryParams: { q: term } });
    this.searchTerm.set('');
  }

  protected notificationTone(tone: AppNotification['tone']): string {
    const base = 'mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ';
    return (
      base +
      {
        primary: 'bg-primary-soft text-primary',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
      }[tone]
    );
  }

  protected openNotification(notification: AppNotification): void {
    this.toast.info(notification.title, notification.description);
  }

  protected allNotifications(): void {
    this.toast.info(
      'Notifikasi',
      'Halaman daftar notifikasi bisa ditambahkan sesuai kebutuhan aplikasi Anda.',
    );
  }

  protected goToProfile(): void {
    this.router.navigate(['/settings'], { queryParams: { tab: 'umum' } });
  }

  protected goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  protected showHelp(): void {
    this.toast.info('Bantuan', 'Tekan ⌘K / Ctrl+K untuk fokus ke kolom pencarian.');
  }

  protected logout(): void {
    this.toast.success('Berhasil keluar', 'Sesi demo telah diakhiri.');
    this.router.navigate(['/auth/login']);
  }

  private refreshPageTitle(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    this.pageTitle.set((route.data['page'] as string | undefined) ?? 'Halaman');
  }
}
