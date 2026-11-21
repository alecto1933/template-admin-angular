import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HoverCardSide, UiHoverCard } from '@/shared/ui/hover-card/hover-card';

@Component({
  imports: [UiHoverCard],
  template: `
    <span class="group relative inline-flex">
      <button type="button">Profil</button>
      <ui-hover-card [side]="side()">
        <div class="card">Info pengguna</div>
      </ui-hover-card>
    </span>
  `,
})
class HoverCardHost {
  readonly side = signal<HoverCardSide>('bottom');
}

describe('UiHoverCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HoverCardHost] }).compileComponents();
  });

  it('renders projected content', () => {
    const fixture = TestBed.createComponent(HoverCardHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('ui-hover-card')?.textContent).toContain('Info pengguna');
    expect(host.querySelector('.ui-hover-card')).not.toBeNull();
  });

  it('exposes the configured side on the host', () => {
    const fixture = TestBed.createComponent(HoverCardHost);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('ui-hover-card') as HTMLElement;
    expect(card.getAttribute('data-side')).toBe('bottom');

    fixture.componentInstance.side.set('top');
    fixture.detectChanges();
    expect(card.getAttribute('data-side')).toBe('top');
  });
});
