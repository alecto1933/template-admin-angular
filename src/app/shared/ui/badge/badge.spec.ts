import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiBadge, BadgeVariant } from '@/shared/ui/badge/badge';

@Component({
  imports: [UiBadge],
  template: `
    <span id="default" uiBadge>Default</span>
    <span id="success" uiBadge variant="success">Aktif</span>
    <span id="outline" uiBadge variant="outline">Arsip</span>
  `,
})
class BadgeHost {}

describe('UiBadge', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BadgeHost] }).compileComponents();
  });

  it('renders projected content with the default variant', () => {
    const fixture = TestBed.createComponent(BadgeHost);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('#default') as HTMLElement;

    expect(badge.textContent?.trim()).toBe('Default');
    expect(badge.getAttribute('data-variant')).toBe('default');
  });

  it('reflects each variant on the host data-variant attribute', () => {
    const fixture = TestBed.createComponent(BadgeHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const variants: BadgeVariant[] = ['success', 'outline'];

    expect((host.querySelector('#success') as HTMLElement).getAttribute('data-variant')).toBe(
      variants[0],
    );
    expect((host.querySelector('#outline') as HTMLElement).getAttribute('data-variant')).toBe(
      variants[1],
    );
  });
});
