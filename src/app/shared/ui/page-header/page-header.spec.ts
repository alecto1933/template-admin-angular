import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiPageHeader } from '@/shared/ui/page-header/page-header';

@Component({
  imports: [UiPageHeader],
  template: `
    <ui-page-header title="Daftar Pesanan" description="Kelola semua pesanan masuk">
      <button type="button" class="action">Tambah</button>
    </ui-page-header>
  `,
})
class PageHeaderHost {}

@Component({
  imports: [UiPageHeader],
  template: `<ui-page-header title="Tanpa deskripsi" />`,
})
class MinimalPageHeaderHost {}

describe('UiPageHeader', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderHost, MinimalPageHeaderHost],
    }).compileComponents();
  });

  it('renders the title, description and projected actions', () => {
    const fixture = TestBed.createComponent(PageHeaderHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('h1')?.textContent?.trim()).toBe('Daftar Pesanan');
    expect(host.querySelector('p')?.textContent).toContain('Kelola semua pesanan masuk');
    expect(host.querySelector('.action')?.textContent).toContain('Tambah');
    expect(host.querySelector('header')).not.toBeNull();
  });

  it('omits the description when not provided', () => {
    const fixture = TestBed.createComponent(MinimalPageHeaderHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('h1')?.textContent?.trim()).toBe('Tanpa deskripsi');
    expect(host.querySelector('p')).toBeNull();
  });
});
