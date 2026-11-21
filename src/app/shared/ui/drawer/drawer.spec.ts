import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiDrawer, DrawerDirection } from '@/shared/ui/drawer/drawer';

@Component({
  imports: [UiDrawer],
  template: `
    <ui-drawer
      title="Filter"
      description="Saring data"
      [direction]="direction()"
      [(open)]="open"
    >
      <p class="body">Isi drawer</p>
      <button drawerFooter type="button" class="footer-action">Terapkan</button>
    </ui-drawer>
  `,
})
class DrawerHost {
  readonly open = signal(false);
  readonly direction = signal<DrawerDirection>('right');
}

describe('UiDrawer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DrawerHost] }).compileComponents();
  });

  it('renders closed by default with title and projected content', () => {
    const fixture = TestBed.createComponent(DrawerHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const panel = host.querySelector('.ui-drawer-panel')!;
    expect(panel.getAttribute('data-open')).toBe('false');
    expect(panel.getAttribute('aria-hidden')).toBe('true');
    expect(panel.hasAttribute('inert')).toBe(true);
    expect(panel.querySelector('h2')?.textContent).toContain('Filter');
    expect(host.querySelector('.body')?.textContent).toContain('Isi drawer');
    expect(host.querySelector('.footer-action')).not.toBeNull();
  });

  it('reflects open state and direction on the panel', () => {
    const fixture = TestBed.createComponent(DrawerHost);
    fixture.componentInstance.direction.set('left');
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const panel = host.querySelector('.ui-drawer-panel')!;
    const backdrop = host.querySelector('.ui-drawer-backdrop')!;

    expect(panel.getAttribute('data-open')).toBe('true');
    expect(panel.getAttribute('data-direction')).toBe('left');
    expect(panel.getAttribute('aria-hidden')).toBe('false');
    expect(panel.hasAttribute('inert')).toBe(false);
    expect(backdrop.getAttribute('data-open')).toBe('true');
  });

  it('closes from the close button and the backdrop', () => {
    const fixture = TestBed.createComponent(DrawerHost);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('button[aria-label="Tutup drawer"]')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    host.querySelector<HTMLElement>('.ui-drawer-backdrop')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('closes on escape keydown', () => {
    const fixture = TestBed.createComponent(DrawerHost);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(false);
  });
});
