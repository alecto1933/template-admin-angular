import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslationService } from '@/core/i18n/translation.service';
import { AppNotification, NOTIFICATION_TEXTS } from '@/core/i18n/layout.texts';
import { SessionService } from '@/core/state/session.service';
import { LanguageService } from '@/core/language.service';
import { LANGUAGES, languageInfo } from '@/core/i18n/language';
import { ThemeService } from '@/core/theme/theme.service';
import { UiAlertDialog } from '@/shared/ui/alert-dialog/alert-dialog';
import { UiIcon } from '@/shared/ui/icon/icon';
import { UiTooltip } from '@/shared/ui/tooltip/tooltip';
import { ToastService } from '@/shared/ui/toast/toast.service';

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon, CdkMenu, CdkMenuItem, CdkMenuTrigger, UiAlertDialog, UiTooltip],
  template: `
    <header class="relative z-30 border-b border-sidebar-border bg-sidebar">
      <div class="flex h-16 items-center gap-3 px-4 md:px-6 lg:px-8">
        <span class="group relative inline-flex">
          <button
            type="button"
            class="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            (click)="toggleNavigation.emit()"
            [attr.aria-label]="t().toggleNavigation"
          >
            <ui-icon name="menu" class="size-5" />
          </button>
          <ui-tooltip position="bottom-start">{{ t().toggleNavigation }}</ui-tooltip>
        </span>

        <div class="flex min-w-0 flex-col">
          <span
            class="truncate font-display text-[13px] font-semibold tracking-tight text-foreground sm:text-sm"
          >
            {{ pageTitle() }}
          </span>
        </div>

        <div class="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span class="group relative inline-flex">
            <button
              type="button"
              class="grid size-10 cursor-pointer place-items-center rounded-xl transition-colors hover:bg-accent"
              [cdkMenuTriggerFor]="languageMenu"
              [attr.aria-label]="'Language: ' + languageInfo(language.lang()).label"
            >
              <img
                [src]="languageInfo(language.lang()).flag"
                alt=""
                class="h-4 w-6 rounded-[2px] object-cover ring-1 ring-black/5"
              />
            </button>
            <ui-tooltip position="bottom">{{ languageInfo(language.lang()).label }}</ui-tooltip>
          </span>

          <span class="group relative inline-flex">
            <button
              type="button"
              class="relative grid size-10 cursor-pointer place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              [cdkMenuTriggerFor]="notificationsMenu"
              [attr.aria-label]="t().notifications"
            >
              <ui-icon name="bell" class="size-[18px]" />
              <span
                class="absolute top-2.5 right-2.5 size-2 rounded-full bg-destructive ring-2 ring-sidebar"
              ></span>
            </button>
            <ui-tooltip position="bottom">{{ t().notifications }}</ui-tooltip>
          </span>

          <div class="mx-1 hidden h-6 w-px bg-border sm:block"></div>

          <span class="group relative inline-flex">
            <button
              type="button"
              class="flex cursor-pointer items-center gap-2 rounded-xl p-1 pr-1.5 transition-colors hover:bg-accent sm:pr-2"
              [cdkMenuTriggerFor]="userMenu"
              [attr.aria-label]="t().userMenu"
            >
              <span
                class="grid size-8 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground"
              >
                {{ session.initials() || '?' }}
              </span>
              <span class="hidden text-left md:block">
                <span class="block text-[13px] leading-tight font-semibold">
                  {{ session.user()?.name ?? t().guest }}
                </span>
                <span class="block text-[11px] leading-tight text-muted-foreground">
                  {{ session.user()?.role ?? '-' }}
                </span>
              </span>
              <ui-icon name="chevron-down" class="hidden size-3.5 text-muted-foreground md:block" />
            </button>
            <ui-tooltip position="bottom-end">{{ t().userMenu }}</ui-tooltip>
          </span>
        </div>
      </div>

      <ng-template #languageMenu>
        <div cdkMenu class="ui-menu-panel w-44">
          @for (option of languages; track option.code) {
            <button cdkMenuItem type="button" class="ui-menu-item" (click)="language.set(option.code)">
              <img
                [src]="option.flag"
                alt=""
                class="h-3.5 w-5 rounded-[2px] object-cover ring-1 ring-black/5"
              />
              {{ option.label }}
              @if (language.lang() === option.code) {
                <ui-icon name="check" class="ml-auto size-4 text-primary" />
              }
            </button>
          }
        </div>
      </ng-template>

      <ng-template #notificationsMenu>
        <div cdkMenu class="ui-menu-panel w-80">
          <div class="flex items-center justify-between px-3 py-2">
            <p class="text-sm font-semibold text-foreground">{{ t().notifications }}</p>
            <span
              class="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary"
            >
              {{ notifications().length }} {{ t().newNotifications }}
            </span>
          </div>
          <div class="ui-menu-separator"></div>

          @for (notification of notifications(); track notification.title) {
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
            {{ t().viewAllNotifications }}
          </button>
        </div>
      </ng-template>

      <ng-template #userMenu>
        <div cdkMenu class="ui-menu-panel w-60">
          <div class="px-3 py-2">
            <p class="text-sm font-semibold text-foreground">{{ session.user()?.name ?? t().guest }}</p>
            <p class="truncate text-xs text-muted-foreground">{{ session.user()?.email ?? '-' }}</p>
          </div>
          <div class="ui-menu-separator"></div>
          <button cdkMenuItem type="button" class="ui-menu-item" (click)="showHelp()">
            <ui-icon name="circle-help" class="size-4 text-muted-foreground" />
            {{ t().help }}
            <span class="ui-shortcut">?</span>
          </button>
          <button cdkMenuItem type="button" class="ui-menu-item" (click)="theme.toggle()">
            <ui-icon
              [name]="theme.isDark() ? 'sun' : 'moon'"
              class="size-4 text-muted-foreground"
            />
            {{ theme.isDark() ? t().lightMode : t().darkMode }}
          </button>
          <div class="ui-menu-separator"></div>
          <button cdkMenuItem type="button" class="ui-menu-item is-destructive" (click)="logout()">
            <ui-icon name="log-out" class="size-4" />
            {{ t().logout }}
          </button>
        </div>
      </ng-template>

      <ui-alert-dialog
        #logoutDialog
        [title]="t().logoutTitle"
        [description]="t().logoutDescription"
        [confirmLabel]="t().confirmLogout"
        [cancelLabel]="t().cancel"
        confirmVariant="destructive"
        (confirmed)="confirmLogout()"
      />
    </header>
  `,
})
export class AppTopbar {  readonly toggleNavigation = output<void>();

  private readonly i18n = inject(TranslationService);

  protected readonly t = this.i18n.layout;
  protected readonly lang = this.i18n.lang;
  protected readonly theme = inject(ThemeService);
  protected readonly language = inject(LanguageService);
  protected readonly languages = LANGUAGES;
  protected readonly languageInfo = languageInfo;
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly notifications = computed(() => NOTIFICATION_TEXTS[this.lang()]);
  private readonly pageKey = signal('Home');
  protected readonly pageTitle = computed(() =>
    this.pageKey() === 'Home' ? this.t().pageHome : this.pageKey(),
  );

  private readonly logoutDialog = viewChild.required(UiAlertDialog);

  constructor() {
    this.router.events
      .pipe(
        startWith(null),
        filter((event) => event === null || event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.refreshPageTitle());
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
    this.toast.info(this.t().notifications, this.t().notificationsToast);
  }

  protected showHelp(): void {
    this.toast.info(this.t().helpToastTitle, this.t().helpToastMessage);
  }

  protected logout(): void {
    this.logoutDialog().open();
  }

  protected confirmLogout(): void {
    this.session.logout();
    this.toast.success(this.t().logoutSuccessTitle, this.t().logoutSuccessMessage);
    this.router.navigate(['/auth/login']);
  }

  private refreshPageTitle(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    this.pageKey.set((route.data['page'] as string | undefined) ?? 'Home');
  }
}
