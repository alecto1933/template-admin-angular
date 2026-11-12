import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { NAV_SECTIONS, NavItem } from '../core/nav';
import { UiIcon } from '../shared/ui/icon/icon';
import { ToastService } from '../shared/ui/toast/toast.service';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, UiIcon],
  template: `
    <aside
      class="ui-sidebar"
      [attr.data-collapsed]="collapsed()"
      [attr.data-mobile-open]="mobileOpen()"
      aria-label="Navigasi utama"
    >
      <div class="ui-sidebar-header flex h-16 shrink-0 items-center gap-2 px-4">
        <a
          routerLink="/dashboard"
          class="flex min-w-0 items-center gap-2.5 rounded-xl outline-none"
          aria-label="Alecto Admin — ke dashboard"
          (click)="closeMobile.emit()"
        >
          <span
            class="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25"
          >
            <ui-icon name="sparkles" class="size-5" />
          </span>
          <span
            class="sidebar-label font-display text-[17px] font-bold tracking-tight text-foreground"
          >
            Alecto<span class="text-primary">.</span>
          </span>
        </a>

        <button
          type="button"
          class="ml-auto grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
          (click)="closeMobile.emit()"
          aria-label="Tutup menu"
        >
          <ui-icon name="x" class="size-4" />
        </button>
      </div>

      <div class="ui-sidebar-scroll">
        @for (section of sections; track section.label) {
          <div class="mb-6 last:mb-0">
            <p
              class="sidebar-label px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/70 uppercase"
            >
              {{ section.label }}
            </p>
            <nav class="space-y-1">
              @for (item of section.items; track item.path) {
                @if (item.children?.length) {
                  <div>
                    <button
                      type="button"
                      class="ui-sidebar-link w-full"
                      [attr.title]="collapsed() ? item.label : null"
                      [attr.aria-expanded]="isGroupOpen(item.path)"
                      [class.text-sidebar-accent-foreground]="isGroupActive(item)"
                      (click)="toggleGroup(item.path)"
                    >
                      <ui-icon [name]="item.icon" class="size-[18px] shrink-0" />
                      <span class="sidebar-label">{{ item.label }}</span>
                      @if (item.badge) {
                        <span class="ui-sidebar-badge sidebar-label">{{ item.badge }}</span>
                      }
                      <span class="sidebar-label">
                        <ui-icon
                          name="chevron-down"
                          class="size-3.5 shrink-0 transition-transform duration-200"
                          [class.rotate-180]="isGroupOpen(item.path)"
                        />
                      </span>
                    </button>

                    <div class="sidebar-submenu mt-1 space-y-1" [hidden]="!isGroupOpen(item.path)">
                      @for (child of item.children ?? []; track child.path) {
                        <a
                          class="ui-sidebar-link h-9 pl-10 text-[13px]"
                          [routerLink]="child.path"
                          routerLinkActive="is-active"
                          [routerLinkActiveOptions]="{ exact: !!child.exact }"
                          [attr.title]="collapsed() ? child.label : null"
                          (click)="closeMobile.emit()"
                        >
                          <span class="sidebar-label">{{ child.label }}</span>
                        </a>
                      }
                    </div>
                  </div>
                } @else if (item.path === '/help') {
                  <button
                    type="button"
                    class="ui-sidebar-link w-full"
                    [attr.title]="collapsed() ? item.label : null"
                    (click)="openHelp()"
                  >
                    <ui-icon [name]="item.icon" class="size-[18px] shrink-0" />
                    <span class="sidebar-label">{{ item.label }}</span>
                  </button>
                } @else {
                  <a
                    class="ui-sidebar-link"
                    [routerLink]="item.path"
                    routerLinkActive="is-active"
                    [routerLinkActiveOptions]="{ exact: !!item.exact }"
                    [attr.title]="collapsed() ? item.label : null"
                    (click)="closeMobile.emit()"
                  >
                    <ui-icon [name]="item.icon" class="size-[18px] shrink-0" />
                    <span class="sidebar-label">{{ item.label }}</span>
                    @if (item.badge) {
                      <span class="ui-sidebar-badge sidebar-label">{{ item.badge }}</span>
                    }
                  </a>
                }
              }
            </nav>
          </div>
        }
      </div>
    </aside>
  `,
})
export class AppSidebar {
  readonly collapsed = input(false);
  readonly mobileOpen = input(false);

  readonly closeMobile = output<void>();
  readonly toggleCollapse = output<void>();

  protected readonly sections = NAV_SECTIONS;

  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly currentUrl = signal(this.router.url);
  protected readonly expanded = signal<ReadonlySet<string>>(new Set(['/components']));

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const url = this.router.url;
        this.currentUrl.set(url);

        const group = this.sections
          .flatMap((section) => section.items)
          .find((item) => item.children?.some((child) => this.matches(url, child.path)));

        if (group) {
          this.expanded.update((paths) => new Set([...paths, group.path]));
        }
      });
  }

  protected toggleGroup(path: string): void {
    if (this.collapsed()) {
      this.expanded.update((paths) => new Set([...paths, path]));
      this.toggleCollapse.emit();
      return;
    }

    this.expanded.update((paths) => {
      const next = new Set(paths);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  protected isGroupOpen(path: string): boolean {
    return this.expanded().has(path);
  }

  protected isGroupActive(item: NavItem): boolean {
    return !!item.children?.some((child) => this.matches(this.currentUrl(), child.path));
  }

  private matches(url: string, path: string): boolean {
    return url === path || url.startsWith(path + '/');
  }

  protected openHelp(): void {
    this.toast.info(
      'Pusat bantuan',
      'Ini template demo — hubungkan tombol ini ke dokumentasi tim Anda.',
    );
  }
}
