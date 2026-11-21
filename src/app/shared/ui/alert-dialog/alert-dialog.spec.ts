import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiAlertDialog } from '@/shared/ui/alert-dialog/alert-dialog';

@Component({
  imports: [UiAlertDialog],
  template: `
    <ui-alert-dialog
      #dialog
      title="Hapus proyek?"
      description="Tindakan ini tidak bisa dibatalkan."
      confirmLabel="Hapus"
      cancelLabel="Batal"
      confirmVariant="destructive"
      (confirmed)="confirmedCount = confirmedCount + 1"
      (cancelled)="cancelledCount = cancelledCount + 1"
    >
      <p class="alert-body">Proyek akan dihapus permanen.</p>
    </ui-alert-dialog>
  `,
})
class AlertDialogHost {
  @ViewChild('dialog', { static: true }) dialog!: UiAlertDialog;
  confirmedCount = 0;
  cancelledCount = 0;
}

describe('UiAlertDialog', () => {
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
    await TestBed.configureTestingModule({ imports: [AlertDialogHost] }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(AlertDialogHost);
    fixture.detectChanges();
    const host = fixture.componentInstance as AlertDialogHost;
    const root = fixture.nativeElement as HTMLElement;
    const panel = root.querySelector('dialog') as HTMLDialogElement;
    const buttons = panel.querySelectorAll<HTMLButtonElement>('button');

    return { fixture, host, panel, buttons };
  }

  it('renders the title, description, body, and action buttons', () => {
    const { panel, buttons } = setup();

    expect(panel.getAttribute('role')).toBe('alertdialog');
    expect(panel.querySelector('h2')?.textContent?.trim()).toBe('Hapus proyek?');
    expect(panel.textContent).toContain('Tindakan ini tidak bisa dibatalkan.');
    expect(panel.querySelector('.alert-body')?.textContent).toContain('dihapus permanen');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent?.trim()).toBe('Batal');
    expect(buttons[1].textContent?.trim()).toBe('Hapus');
    expect(buttons[1].getAttribute('data-variant')).toBe('destructive');
    expect(panel.querySelector('[aria-label="Tutup dialog"]')).toBeNull();
  });

  it('emits confirmed when the confirm button is clicked', () => {
    const { fixture, host, buttons } = setup();

    host.dialog.open();
    fixture.detectChanges();

    buttons[1].click();
    fixture.detectChanges();

    expect(host.confirmedCount).toBe(1);
    expect(host.cancelledCount).toBe(0);
  });

  it('emits cancelled when the cancel button is clicked', () => {
    const { fixture, host, buttons } = setup();

    host.dialog.open();
    fixture.detectChanges();

    buttons[0].click();
    fixture.detectChanges();

    expect(host.cancelledCount).toBe(1);
    expect(host.confirmedCount).toBe(0);
  });

  it('treats a programmatic close as a cancellation', () => {
    const { fixture, host } = setup();

    host.dialog.open();
    fixture.detectChanges();
    host.dialog.close();
    fixture.detectChanges();

    expect(host.cancelledCount).toBe(1);
    expect(host.confirmedCount).toBe(0);
  });
});
