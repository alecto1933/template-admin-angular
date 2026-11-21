import { TestBed } from '@angular/core/testing';
import { AppUpdateService, AppVersionInfo } from '@/core/update/app-update.service';
import { AppUpdateBanner } from '@/layout/update-banner';
import { computed, signal } from '@angular/core';

class UpdateServiceStub {
  readonly version = signal<AppVersionInfo | null>(null);
  readonly updateAvailable = computed(() => this.version() !== null);
  readonly dismiss = vi.fn(() => this.version.set(null));
  readonly reload = vi.fn();
}

describe('AppUpdateBanner', () => {
  let stub: UpdateServiceStub;

  beforeEach(async () => {
    stub = new UpdateServiceStub();
    await TestBed.configureTestingModule({
      imports: [AppUpdateBanner],
      providers: [{ provide: AppUpdateService, useValue: stub }],
    }).compileComponents();
  });

  it('stays hidden while no update is available', () => {
    const fixture = TestBed.createComponent(AppUpdateBanner);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });

  it('renders the notice and triggers reload/dismiss actions', () => {
    stub.version.set({ version: '2.0.1', buildId: 'build-2' });

    const fixture = TestBed.createComponent(AppUpdateBanner);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Versi baru tersedia');
    expect(host.textContent).toContain('Muat ulang');

    const buttons = Array.from(host.querySelectorAll('button'));
    buttons.find((button) => button.textContent?.includes('Muat ulang'))?.click();
    buttons.find((button) => button.textContent?.includes('Nanti saja'))?.click();

    expect(stub.reload).toHaveBeenCalledTimes(1);
    expect(stub.dismiss).toHaveBeenCalledTimes(1);
  });
});
