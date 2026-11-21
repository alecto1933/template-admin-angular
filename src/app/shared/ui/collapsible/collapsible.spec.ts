import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiCollapsible } from '@/shared/ui/collapsible/collapsible';

@Component({
  imports: [UiCollapsible],
  template: `
    <ui-collapsible
      title="Detail"
      description="Informasi tambahan"
      [(open)]="open"
      [disabled]="disabled()"
    >
      <p class="content">Isi panel</p>
    </ui-collapsible>
  `,
})
class CollapsibleHost {
  readonly open = signal(false);
  readonly disabled = signal(false);
}

describe('UiCollapsible', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CollapsibleHost] }).compileComponents();
  });

  it('renders title, description and projected content', () => {
    const fixture = TestBed.createComponent(CollapsibleHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Detail');
    expect(host.textContent).toContain('Informasi tambahan');
    expect(host.querySelector('.content')?.textContent).toContain('Isi panel');
    expect(host.querySelector('.ui-collapsible-trigger')?.getAttribute('aria-expanded')).toBe(
      'false',
    );
  });

  it('toggles open state on trigger click', () => {
    const fixture = TestBed.createComponent(CollapsibleHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLButtonElement>('.ui-collapsible-trigger')!;

    trigger.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('.ui-collapsible')?.getAttribute('data-state')).toBe('open');
    expect(host.querySelector('.ui-collapsible-content')?.getAttribute('data-state')).toBe('open');
    expect(host.querySelector('.ui-collapsible-content')?.hasAttribute('inert')).toBe(false);

    trigger.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(false);
    expect(host.querySelector('.ui-collapsible-content')?.getAttribute('data-state')).toBe(
      'closed',
    );
    expect(host.querySelector('.ui-collapsible-content')?.hasAttribute('inert')).toBe(true);
  });

  it('does not toggle when disabled', () => {
    const fixture = TestBed.createComponent(CollapsibleHost);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.ui-collapsible-trigger',
    ) as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);

    trigger.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
