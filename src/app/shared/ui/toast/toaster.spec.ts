import { TestBed } from '@angular/core/testing';
import { ToastService } from '@/shared/ui/toast/toast.service';
import { UiToaster } from '@/shared/ui/toast/toaster';

describe('UiToaster', () => {
  let service: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UiToaster] }).compileComponents();
    service = TestBed.inject(ToastService);
  });

  it('renders an empty notification region when there are no toasts', () => {
    const fixture = TestBed.createComponent(UiToaster);
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector('[role="region"]') as HTMLElement;

    expect(region).toBeTruthy();
    expect(region.getAttribute('aria-label')).toBe('Notifikasi');
    expect(region.querySelectorAll('.ui-toast').length).toBe(0);
  });

  it('renders active toasts with title, description and variant icon', () => {
    service.success('Berhasil', 'Data tersimpan');
    service.error('Gagal memuat');

    const fixture = TestBed.createComponent(UiToaster);
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector('[role="region"]') as HTMLElement;
    const toasts = region.querySelectorAll('.ui-toast');

    expect(toasts.length).toBe(2);
    expect(toasts[0].textContent).toContain('Berhasil');
    expect(toasts[0].textContent).toContain('Data tersimpan');
    expect(toasts[1].textContent).toContain('Gagal memuat');
    expect(toasts[0].getAttribute('role')).toBe('status');
    expect(toasts[0].querySelector('ui-icon')).toBeTruthy();
  });

  it('dismisses a toast when its close button is clicked', () => {
    service.info('Info', 'Pesan');
    const fixture = TestBed.createComponent(UiToaster);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const closeButton = host.querySelector('[aria-label="Tutup notifikasi"]') as HTMLButtonElement;

    expect(host.querySelectorAll('.ui-toast').length).toBe(1);

    closeButton.click();
    fixture.detectChanges();

    expect(service.toasts()).toEqual([]);
    expect(host.querySelectorAll('.ui-toast').length).toBe(0);
  });

  it('applies the position classes from the service', () => {
    service.setPosition('top-left');
    const fixture = TestBed.createComponent(UiToaster);
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector('[role="region"]') as HTMLElement;

    expect(region.classList.contains('top-4')).toBe(true);
    expect(region.classList.contains('left-4')).toBe(true);
  });
});
