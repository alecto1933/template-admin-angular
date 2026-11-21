import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiTab, UiTabs } from '@/shared/ui/tabs/tabs';

@Component({
  imports: [UiTabs, UiTab],
  template: `
    <ui-tabs ariaLabel="Pengaturan">
      <ng-template uiTab label="Umum"><p>Konten umum</p></ng-template>
      <ng-template uiTab label="Keamanan"><p>Konten keamanan</p></ng-template>
      <ng-template uiTab label="Notifikasi"><p>Konten notifikasi</p></ng-template>
    </ui-tabs>
  `,
})
class TabsHost {}

describe('UiTabs', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TabsHost] }).compileComponents();
  });

  it('renders the tablist and only the active panel content', () => {
    const fixture = TestBed.createComponent(TabsHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const tablist = host.querySelector('[role="tablist"]') as HTMLElement;
    const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');

    expect(tablist).toBeTruthy();
    expect(tablist.getAttribute('aria-label')).toBe('Pengaturan');
    expect(tabs.length).toBe(3);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(host.querySelector('[role="tabpanel"]')?.textContent).toContain('Konten umum');
    expect(host.querySelector('[role="tabpanel"]')?.textContent).not.toContain('Konten keamanan');
  });

  it('switches the active panel when a tab is clicked', () => {
    const fixture = TestBed.createComponent(TabsHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const panel = host.querySelector('[role="tabpanel"]') as HTMLElement;

    tabs[1].click();
    fixture.detectChanges();

    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('data-active')).toBe('true');
    expect(tabs[1].getAttribute('tabindex')).toBe('0');
    expect(panel.textContent).toContain('Konten keamanan');
    expect(panel.textContent).not.toContain('Konten umum');
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs[1].id);
  });

  it('moves between tabs with the keyboard', () => {
    const fixture = TestBed.createComponent(TabsHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const tablist = host.querySelector('[role="tablist"]') as HTMLElement;
    const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');

    tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(tabs[1].getAttribute('aria-selected')).toBe('true');

    tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();

    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    expect(host.querySelector('[role="tabpanel"]')?.textContent).toContain('Konten notifikasi');
  });
});
