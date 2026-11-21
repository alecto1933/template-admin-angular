import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiAccordion, UiAccordionItem } from '@/shared/ui/accordion/accordion';

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

@Component({
  imports: [UiAccordion, UiAccordionItem],
  template: `
    <ui-accordion type="multiple">
      <ui-accordion-item title="Satu" [open]="true">Panel satu.</ui-accordion-item>
      <ui-accordion-item title="Dua" [open]="true">Panel dua.</ui-accordion-item>
    </ui-accordion>
  `,
})
class MultipleAccordionHost {}

@Component({
  imports: [UiAccordion, UiAccordionItem],
  template: `
    <ui-accordion>
      <ui-accordion-item title="Satu" disabled>Panel satu.</ui-accordion-item>
    </ui-accordion>
  `,
})
class DisabledAccordionHost {}

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

  it('renders titles and panel content', () => {
    const fixture = TestBed.createComponent(SingleAccordionHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const triggers = host.querySelectorAll<HTMLButtonElement>('.ui-accordion-trigger');

    expect(triggers.length).toBe(2);
    expect(triggers[0].textContent?.trim()).toContain('Satu');
    expect(host.querySelectorAll('.ui-accordion-body')[0].textContent?.trim()).toBe('Panel satu.');
  });

  it('allows multiple panels open at once in multiple mode', () => {
    const fixture = TestBed.createComponent(MultipleAccordionHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const triggers = host.querySelectorAll<HTMLButtonElement>('.ui-accordion-trigger');

    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(triggers[1].getAttribute('aria-expanded')).toBe('true');

    triggers[1].click();
    fixture.detectChanges();

    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(triggers[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('does not toggle a disabled item', () => {
    const fixture = TestBed.createComponent(DisabledAccordionHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLButtonElement>(
      '.ui-accordion-trigger',
    ) as HTMLButtonElement;

    expect(trigger.disabled).toBe(true);
    expect(host.querySelector('.ui-accordion-item')?.getAttribute('data-disabled')).toBe('');

    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
