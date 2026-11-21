import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PopoverAlign, UiPopover } from '@/shared/ui/popover/popover';

@Component({
  imports: [UiPopover],
  template: `
    <ui-popover [open]="open()" (openChange)="open.set($event)" [align]="align()">
      Isi popover
    </ui-popover>
  `,
})
class PopoverHost {
  readonly open = signal(false);
  readonly align = signal<PopoverAlign>('start');
}

describe('UiPopover', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PopoverHost] }).compileComponents();
  });

  it('renders projected content and defaults to a closed start-aligned panel', () => {
    const fixture = TestBed.createComponent(PopoverHost);
    fixture.detectChanges();

    const popover = fixture.nativeElement.querySelector('ui-popover') as HTMLElement;

    expect(popover).toBeTruthy();
    expect(popover.textContent).toContain('Isi popover');
    expect(popover.getAttribute('data-align')).toBe('start');
    expect(popover.hasAttribute('data-open')).toBe(false);
  });

  it('reflects the open model and align input on the host element', () => {
    const fixture = TestBed.createComponent(PopoverHost);
    fixture.detectChanges();

    const host = fixture.componentInstance;
    const popover = fixture.nativeElement.querySelector('ui-popover') as HTMLElement;

    host.open.set(true);
    host.align.set('end');
    fixture.detectChanges();

    expect(popover.hasAttribute('data-open')).toBe(true);
    expect(popover.getAttribute('data-align')).toBe('end');

    host.open.set(false);
    fixture.detectChanges();

    expect(popover.hasAttribute('data-open')).toBe(false);
  });
});
