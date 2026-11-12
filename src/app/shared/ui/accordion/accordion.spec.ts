import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiAccordion, UiAccordionItem } from './accordion';

@Component({
  imports: [UiAccordion, UiAccordionItem],
  template: `
    <ui-accordion>
      <ui-accordion-item title="Satu" [open]="true">Panel satu.</ui-accordion-item>
      <ui-accordion-item title="Dua">Panel dua.</ui-accordion-item>
    </ui-accordion>
  `,
})
class SingleAccordionHost {}

@Component({
  imports: [UiAccordion, UiAccordionItem],
  template: `
    <ui-accordion [collapsible]="false">
      <ui-accordion-item title="Satu" [open]="true">Panel satu.</ui-accordion-item>
      <ui-accordion-item title="Dua">Panel dua.</ui-accordion-item>
    </ui-accordion>
  `,
})
class NonCollapsibleAccordionHost {}

describe('UiAccordion', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  it('keeps only one panel open in single mode', () => {
    const fixture = TestBed.createComponent(SingleAccordionHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const triggers = host.querySelectorAll<HTMLButtonElement>('.ui-accordion-trigger');

    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');

    triggers[1].click();
    fixture.detectChanges();

    expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
    expect(triggers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('does not close the last panel when collapsible is false', () => {
    const fixture = TestBed.createComponent(NonCollapsibleAccordionHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const triggers = host.querySelectorAll<HTMLButtonElement>('.ui-accordion-trigger');

    triggers[0].click();
    fixture.detectChanges();

    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
  });
});
