import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiIcon } from '@/shared/ui/icon/icon';
import { IconName } from '@/shared/ui/icon/icons';

@Component({
  selector: 'app-icon-host',
  imports: [UiIcon],
  template: `<ui-icon [name]="name()" />`,
})
class IconHost {
  readonly name = signal<IconName>('search');
}

@Component({
  selector: 'app-unknown-icon-host',
  imports: [UiIcon],
  template: `<ui-icon [name]="iconName" />`,
})
class UnknownIconHost {
  readonly iconName = 'not-a-real-icon' as IconName;
}

describe('UiIcon', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconHost, UnknownIconHost],
    }).compileComponents();
  });

  it('renders the svg markup for a known icon name', () => {
    const fixture = TestBed.createComponent(IconHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const svg = host.querySelector('svg')!;
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelector('path')).not.toBeNull();
    expect(svg.innerHTML.length).toBeGreaterThan(0);
  });

  it('updates the svg markup when the name changes', () => {
    const fixture = TestBed.createComponent(IconHost);
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    const searchMarkup = svg.innerHTML;

    fixture.componentInstance.name.set('check');
    fixture.detectChanges();

    expect(svg.innerHTML).not.toBe(searchMarkup);
    expect(svg.innerHTML).toContain('M20 6');
    expect(svg.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('renders no markup for an unknown icon name', () => {
    const fixture = TestBed.createComponent(UnknownIconHost);
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.innerHTML).toBe('');
  });
});
