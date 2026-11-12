import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import { UiButton } from '../button/button';
import { UiDialog } from '../dialog/dialog';

/**
 * Confirmation dialog for destructive or irreversible actions.
 *
 * Unlike <ui-dialog>, it has no close button and does not close when the
 * backdrop is clicked: the user must pick Cancel or Confirm. Escape still
 * closes it and is reported as a cancellation.
 *
 * <ui-alert-dialog #dialog
 *   title="Hapus proyek?"
 *   description="Tindakan ini tidak bisa dibatalkan."
 *   confirmLabel="Hapus"
 *   confirmVariant="destructive"
 *   (confirmed)="remove()"
 * />
 *
 * Open it from a template reference: dialog.open().
 */
@Component({
  selector: 'ui-alert-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiDialog, UiButton],
  template: `
    <ui-dialog
      #dialog
      [title]="title()"
      [description]="description()"
      role="alertdialog"
      [showClose]="false"
      [closeOnBackdrop]="false"
      (closed)="onClosed()"
    >
      <ng-content />

      <div dialogFooter>
        <button uiButton variant="outline" type="button" (click)="cancel()">
          {{ cancelLabel() }}
        </button>
        <button uiButton [variant]="confirmVariant()" type="button" (click)="confirm()">
          {{ confirmLabel() }}
        </button>
      </div>
    </ui-dialog>
  `,
})
export class UiAlertDialog {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly confirmLabel = input('Lanjutkan');
  readonly cancelLabel = input('Batal');
  readonly confirmVariant = input<'primary' | 'destructive'>('primary');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild.required(UiDialog);
  private actionTaken = false;

  open(): void {
    this.actionTaken = false;
    this.dialog().open();
  }

  close(): void {
    this.dialog().close();
  }

  protected confirm(): void {
    this.actionTaken = true;
    this.confirmed.emit();
    this.dialog().close();
  }

  protected cancel(): void {
    this.actionTaken = true;
    this.cancelled.emit();
    this.dialog().close();
  }

  protected onClosed(): void {
    // Escape or programmatic close counts as a cancellation.
    if (!this.actionTaken) {
      this.cancelled.emit();
    }
  }
}
