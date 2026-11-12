import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  input,
  output,
  viewChild,
} from '@angular/core';
import { UiIcon } from '../icon/icon';

/**
 * Dialog built on the native <dialog> element: focus trapping, ESC to close
 * and the inert background come from the browser, so there is no overlay
 * library to maintain.
 *
 * <ui-dialog #dialog title="Pesanan baru" description="...">
 *   ...body...
 *   <div dialogFooter>...actions...</div>
 * </ui-dialog>
 *
 * Open it from a template reference: dialog.open().
 */
@Component({
  selector: 'ui-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `
    <dialog
      #dialog
      class="ui-dialog"
      [attr.role]="role()"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="description() ? descriptionId : null"
      (click)="onBackdropClick($event)"
      (cancel)="onCancel($event)"
      (close)="closed.emit()"
    >
      <div class="flex flex-col">
        <header class="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div class="min-w-0 space-y-1.5">
            <h2
              [id]="titleId"
              class="font-display text-lg font-semibold tracking-tight text-foreground"
            >
              {{ title() }}
            </h2>
            @if (description()) {
              <p [id]="descriptionId" class="text-sm text-muted-foreground">
                {{ description() }}
              </p>
            }
          </div>
          @if (showClose()) {
            <button
              type="button"
              class="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              (click)="close()"
              aria-label="Tutup dialog"
            >
              <ui-icon name="x" class="size-4" />
            </button>
          }
        </header>

        <div class="ui-dialog-body">
          <ng-content />
        </div>

        <footer class="ui-dialog-footer">
          <ng-content select="[dialogFooter]" />
        </footer>
      </div>
    </dialog>
  `,
  styles: `
    .ui-dialog-footer {
      padding: 1rem 1.5rem 1.5rem;
    }

    .ui-dialog-footer:not(:has(*)) {
      display: none;
    }
  `,
})
export class UiDialog {
  private static nextId = 0;

  readonly title = input('');
  readonly description = input('');
  readonly role = input<'dialog' | 'alertdialog'>('dialog');
  readonly showClose = input(true, { transform: booleanAttribute });
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });

  readonly closed = output<void>();

  protected readonly titleId = `ui-dialog-title-${UiDialog.nextId++}`;
  protected readonly descriptionId = `ui-dialog-description-${UiDialog.nextId++}`;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(): void {
    const dialog = this.dialogRef().nativeElement;
    if (!dialog.open) {
      dialog.showModal();
    }
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  protected onCancel(event: Event): void {
    if (!this.closeOnEscape()) {
      event.preventDefault();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop() && event.target === this.dialogRef().nativeElement) {
      this.close();
    }
  }
}
