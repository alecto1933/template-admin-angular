import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiSwitch } from '@/shared/ui/switch/switch';

@Component({
  imports: [UiSwitch],
  template: `
    <ui-switch
      [checked]="checked()"
      (checkedChange)="checked.set($event)"
      [label]="label()"
      [disabled]="disabled()"
      [invalid]="invalid()"
    />
  `,
})
class SwitchHost {
  readonly checked = signal(false);
  readonly label = signal('Notifikasi');
  readonly disabled = signal(false);
  readonly invalid = signal(false);
}

describe('UiSwitch', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SwitchHost] }).compileComponents();
  });

  it('renders a checkbox with label and default unchecked state', () => {
    const fixture = TestBed.createComponent(SwitchHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const track = host.querySelector('.ui-switch-track') as HTMLElement;

    expect(input).toBeTruthy();
    expect(input.checked).toBe(false);
    expect(input.getAttribute('aria-label')).toBe('Notifikasi');
    expect(host.textContent).toContain('Notifikasi');
    expect(track.hasAttribute('data-checked')).toBe(false);
    expect(host.querySelector('ui-switch')?.getAttribute('data-size')).toBe('md');
  });

  it('toggles the checked model and DOM when the input changes', () => {
    const fixture = TestBed.createComponent(SwitchHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const track = fixture.nativeElement.querySelector('.ui-switch-track') as HTMLElement;

    input.click();
    fixture.detectChanges();

    expect(component.checked()).toBe(true);
    expect(input.checked).toBe(true);
    expect(track.hasAttribute('data-checked')).toBe(true);

    input.click();
    fixture.detectChanges();

    expect(component.checked()).toBe(false);
    expect(track.hasAttribute('data-checked')).toBe(false);
  });

  it('disables the input and marks the host invalid', () => {
    const fixture = TestBed.createComponent(SwitchHost);
    const component = fixture.componentInstance;

    component.disabled.set(true);
    component.invalid.set(true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const switchEl = host.querySelector('ui-switch') as HTMLElement;

    expect(input.disabled).toBe(true);
    expect(switchEl.hasAttribute('data-invalid')).toBe(true);
  });
});
