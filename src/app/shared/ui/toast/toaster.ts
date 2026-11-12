import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UiIcon } from '../icon/icon';
import { IconName } from '../icon/icons';
import { ToastPosition, ToastService, ToastVariant } from './toast.service';

@Component({
  selector: 'ui-toaster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `
    <div [class]="containerClasses()" role="region" aria-label="Notifikasi">
      @for (toast of toasts(); track toast.id) {
        <div class="ui-toast" role="status" aria-live="polite">
          <span
            class="grid size-9 shrink-0 place-items-center rounded-xl"
            [class]="iconClasses(toast.variant)"
          >
            <ui-icon [name]="iconName(toast.variant)" class="size-4.5" />
          </span>
          <div class="min-w-0 flex-1 pt-0.5">
            <p class="text-sm font-semibold text-foreground">{{ toast.title }}</p>
            @if (toast.description) {
              <p class="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {{ toast.description }}
              </p>
            }
          </div>
          <button
            type="button"
            class="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Tutup notifikasi"
          >
            <ui-icon name="x" class="size-3.5" />
          </button>
        </div>
      }
    </div>
  `,
})
export class UiToaster {
  protected readonly toastService = inject(ToastService);
  protected readonly toasts = this.toastService.toasts;

  protected readonly containerClasses = computed(() => {
    const base = 'pointer-events-none fixed z-[90] flex w-[min(92vw,23rem)] flex-col gap-2';
    const positions: Record<ToastPosition, string> = {
      'top-left': 'top-4 left-4 items-start',
      'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
      'top-right': 'top-4 right-4 items-end',
      'bottom-left': 'bottom-4 left-4 items-start',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
      'bottom-right': 'bottom-4 right-4 items-end',
    };
    return `${base} ${positions[this.toastService.position()]}`;
  });

  protected iconName(variant: ToastVariant): IconName {
    const icons: Record<ToastVariant, IconName> = {
      success: 'circle-check',
      error: 'triangle-alert',
      warning: 'triangle-alert',
      info: 'info',
    };
    return icons[variant];
  }

  protected iconClasses(variant: ToastVariant): string {
    const base = 'grid size-9 shrink-0 place-items-center rounded-xl ';
    return (
      base +
      {
        success: 'bg-success-soft text-success',
        error: 'bg-destructive-soft text-destructive',
        warning: 'bg-warning-soft text-warning',
        info: 'bg-primary-soft text-primary',
      }[variant]
    );
  }
}
