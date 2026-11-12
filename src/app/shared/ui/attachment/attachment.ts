import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { UiIcon } from '../icon/icon';
import { IconName } from '../icon/icons';

export type AttachmentSize = 'sm' | 'md' | 'lg';

export type AttachmentState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

/** Groups attachments into one bordered list with dividers. */
@Component({
  selector: 'ui-attachment-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'ui-attachment-group' },
})
export class UiAttachmentGroup {}

/**
 * File attachment row with icon or image thumbnail, state, and optional
 * actions. Set `interactive` to make the whole row behave like a button.
 *
 * <ui-attachment
 *   name="invoice.pdf"
 *   description="PDF · 2.4 MB"
 *   icon="file-text"
 *   state="done"
 * >
 *   <button uiButton size="icon-sm" aria-label="Unduh">...</button>
 * </ui-attachment>
 */
@Component({
  selector: 'ui-attachment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `
    <span class="ui-attachment-media">
      @if (image()) {
        <img [src]="image()" [alt]="name()" loading="lazy" />
      } @else {
        <ui-icon [name]="icon()" class="size-5" />
      }

      @if (state() === 'done') {
        <span class="ui-attachment-badge" aria-hidden="true">
          <ui-icon name="check" class="size-2.5" />
        </span>
      }
    </span>

    <span class="ui-attachment-content">
      <span class="ui-attachment-title" [attr.title]="name()">{{ name() }}</span>
      @if (description()) {
        <span class="ui-attachment-description">{{ description() }}</span>
      }

      @if (state() === 'uploading') {
        <span
          class="ui-attachment-progress"
          role="progressbar"
          [attr.aria-label]="'Progres unggah ' + name()"
          [attr.aria-valuenow]="progress()"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span [style.width.%]="progress()"></span>
        </span>
      }
    </span>

    @if (state() === 'uploading' || state() === 'processing') {
      <ui-icon name="loader-circle" class="ui-attachment-spinner size-4 animate-spin" />
    } @else if (state() === 'error') {
      <ui-icon name="triangle-alert" class="ui-attachment-error size-4" />
    }

    <span class="ui-attachment-actions">
      <ng-content />
    </span>
  `,
  host: {
    class: 'ui-attachment',
    '[attr.data-size]': 'size()',
    '[attr.data-state]': 'state()',
    '[attr.data-interactive]': 'interactive() ? "true" : null',
    '[attr.role]': 'interactive() ? "button" : null',
    '[attr.tabindex]': 'interactive() ? 0 : null',
    '[attr.aria-label]': 'interactive() ? "Buka " + name() : null',
    '(click)': 'onActivate($event)',
    '(keydown.enter)': 'onActivate($event)',
    '(keydown.space)': 'onActivate($event)',
  },
})
export class UiAttachment {
  readonly name = input.required<string>();
  readonly description = input('');
  readonly icon = input<IconName>('file-text');
  readonly image = input<string | null>(null);
  readonly size = input<AttachmentSize>('md');
  readonly state = input<AttachmentState>('idle');
  readonly progress = input(0);
  readonly interactive = input(false, { transform: booleanAttribute });

  readonly activated = output<void>();

  protected onActivate(event: Event): void {
    if (!this.interactive()) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest('button, a, input, textarea, select, [data-attachment-action]')) {
      return;
    }

    if (event instanceof KeyboardEvent) {
      event.preventDefault();
    }

    this.activated.emit();
  }
}
