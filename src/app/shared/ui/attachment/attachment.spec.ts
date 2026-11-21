import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiAttachment, UiAttachmentGroup } from '@/shared/ui/attachment/attachment';

@Component({
  imports: [UiAttachment, UiAttachmentGroup],
  template: `
    <ui-attachment-group>
      <ui-attachment
        id="uploading"
        name="invoice.pdf"
        description="PDF · 2.4 MB"
        state="uploading"
        [progress]="42"
      />
      <ui-attachment
        id="interactive"
        name="laporan.xlsx"
        interactive
        (activated)="activations = activations + 1"
      >
        <button type="button" class="row-action" (click)="actionClicks = actionClicks + 1">
          Unduh
        </button>
      </ui-attachment>
    </ui-attachment-group>
  `,
})
class AttachmentHost {
  activations = 0;
  actionClicks = 0;
}

describe('UiAttachment', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AttachmentHost] }).compileComponents();
  });

  it('renders the file name, description, and upload progress', () => {
    const fixture = TestBed.createComponent(AttachmentHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#uploading') as HTMLElement;
    const progress = element.querySelector('[role="progressbar"]') as HTMLElement;

    expect(element.querySelector('.ui-attachment-title')?.textContent?.trim()).toBe('invoice.pdf');
    expect(element.querySelector('.ui-attachment-description')?.textContent?.trim()).toBe(
      'PDF · 2.4 MB',
    );
    expect(element.getAttribute('data-state')).toBe('uploading');
    expect(progress.getAttribute('aria-valuenow')).toBe('42');
    expect((progress.firstElementChild as HTMLElement).style.width).toBe('42%');
  });

  it('emits activated on row click but not when an action is clicked', () => {
    const fixture = TestBed.createComponent(AttachmentHost);
    fixture.detectChanges();

    const host = fixture.componentInstance as AttachmentHost;
    const element = fixture.nativeElement.querySelector('#interactive') as HTMLElement;

    element.click();
    fixture.detectChanges();

    expect(host.activations).toBe(1);

    (element.querySelector('.row-action') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host.actionClicks).toBe(1);
    expect(host.activations).toBe(1);
  });

  it('is not interactive by default', () => {
    const fixture = TestBed.createComponent(AttachmentHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#uploading') as HTMLElement;

    expect(element.hasAttribute('data-interactive')).toBe(false);
    expect(element.getAttribute('role')).toBeNull();
    expect(element.getAttribute('tabindex')).toBeNull();
  });
});
