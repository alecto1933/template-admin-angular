import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UiDialog } from '@/shared/ui/dialog/dialog';

@Component({
  imports: [UiDialog],
  template: `
    <ui-dialog
      #dlg
      title="Pesanan baru"
      description="Lengkapi data pesanan"
      [closeOnBackdrop]="closeOnBackdrop()"
      [closeOnEscape]="closeOnEscape()"
      [showClose]="showClose()"
      (closed)="closedCount.set(closedCount() + 1)"
    >
      <p class="body">Isi dialog</p>
      <button dialogFooter type="button" class="footer-action">Simpan</button>
    </ui-dialog>
  `,
})
class DialogHost {
  readonly closeOnBackdrop = signal(true);
  readonly closeOnEscape = signal(true);
  readonly showClose = signal(true);
  readonly closedCount = signal(0);
}

function getDialog(fixture: ReturnType<typeof TestBed.createComponent<DialogHost>>) {
  return fixture.debugElement.query(By.directive(UiDialog)).componentInstance as UiDialog;
}

describe('UiDialog', () => {
  beforeAll(() => {
    // jsdom ships <dialog> but not the showModal()/close() methods.
    const proto = HTMLDialogElement.prototype as HTMLDialogElement & {
      showModal?: () => void;
      close?: () => void;
    };

    if (!proto.showModal) {
      proto.showModal = function (this: HTMLDialogElement) {
        this.open = true;
      };
    }

    if (!proto.close) {
      proto.close = function (this: HTMLDialogElement) {
        this.open = false;
        this.dispatchEvent(new Event('close'));
      };
    }
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DialogHost] }).compileComponents();
  });

  it('renders title, description, body and footer content', () => {
    const fixture = TestBed.createComponent(DialogHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('h2')?.textContent).toContain('Pesanan baru');
    expect(host.querySelector('p')?.textContent).toContain('Lengkapi data pesanan');
    expect(host.querySelector('.body')?.textContent).toContain('Isi dialog');
    expect(host.querySelector('.footer-action')).not.toBeNull();
    expect(host.querySelector('dialog')?.getAttribute('role')).toBe('dialog');
  });

  it('opens and closes via the API and close button', () => {
    const fixture = TestBed.createComponent(DialogHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const dialogEl = host.querySelector('dialog')!;
    const dialog = getDialog(fixture);

    dialog.open();
    fixture.detectChanges();
    expect(dialogEl.open).toBe(true);

    host.querySelector<HTMLButtonElement>('button[aria-label="Tutup dialog"]')!.click();
    fixture.detectChanges();

    expect(dialogEl.open).toBe(false);
    expect(fixture.componentInstance.closedCount()).toBe(1);
  });

  it('closes when the backdrop is clicked', () => {
    const fixture = TestBed.createComponent(DialogHost);
    fixture.detectChanges();

    const dialogEl = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const dialog = getDialog(fixture);

    dialog.open();
    fixture.detectChanges();

    dialogEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(dialogEl.open).toBe(false);
  });

  it('keeps the dialog open on backdrop click when disabled', () => {
    const fixture = TestBed.createComponent(DialogHost);
    fixture.componentInstance.closeOnBackdrop.set(false);
    fixture.detectChanges();

    const dialogEl = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const dialog = getDialog(fixture);

    dialog.open();
    fixture.detectChanges();

    dialogEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(dialogEl.open).toBe(true);
  });

  it('cancels the escape action when closeOnEscape is false', () => {
    const fixture = TestBed.createComponent(DialogHost);
    fixture.componentInstance.closeOnEscape.set(false);
    fixture.detectChanges();

    const dialogEl = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    getDialog(fixture).open();
    fixture.detectChanges();

    const cancel = new Event('cancel', { cancelable: true });
    dialogEl.dispatchEvent(cancel);

    expect(cancel.defaultPrevented).toBe(true);
  });
});
