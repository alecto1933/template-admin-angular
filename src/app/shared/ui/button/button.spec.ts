import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiButton } from '@/shared/ui/button/button';

@Component({
  imports: [UiButton],
  template: `
    <button id="primary" uiButton>Simpan</button>
    <button id="danger" uiButton variant="destructive" size="lg" type="submit">Hapus</button>
    <button id="off" uiButton [disabled]="true">Nonaktif</button>
    <button id="busy" uiButton [loading]="true">Memuat</button>
  `,
})
class ButtonHost {}

describe('UiButton', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ButtonHost] }).compileComponents();
  });

  it('renders content with default variant, size, and type', () => {
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('#primary') as HTMLButtonElement;

    expect(button.textContent?.trim()).toBe('Simpan');
    expect(button.getAttribute('data-variant')).toBe('primary');
    expect(button.getAttribute('data-size')).toBe('md');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.disabled).toBe(false);
  });

  it('applies variant, size, and type inputs', () => {
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('#danger') as HTMLButtonElement;

    expect(button.getAttribute('data-variant')).toBe('destructive');
    expect(button.getAttribute('data-size')).toBe('lg');
    expect(button.getAttribute('type')).toBe('submit');
  });

  it('disables the native button when disabled or loading', () => {
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const disabled = host.querySelector('#off') as HTMLButtonElement;
    const busy = host.querySelector('#busy') as HTMLButtonElement;

    expect(disabled.hasAttribute('disabled')).toBe(true);
    expect(disabled.disabled).toBe(true);
    expect(busy.hasAttribute('disabled')).toBe(true);
    expect(busy.getAttribute('aria-busy')).toBe('true');
  });

  it('marks disabled and loading buttons as aria-disabled', () => {
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();

    const off = fixture.nativeElement.querySelector('#off') as HTMLButtonElement;
    const busy = fixture.nativeElement.querySelector('#busy') as HTMLButtonElement;

    expect(off.getAttribute('aria-disabled')).toBe('true');
    expect(busy.getAttribute('aria-disabled')).toBe('true');
  });
});
