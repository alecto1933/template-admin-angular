import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastService } from '@/shared/ui/toast/toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts empty and defaults to bottom-right position', () => {
    expect(service.toasts()).toEqual([]);
    expect(service.position()).toBe('bottom-right');
  });

  it('adds success, error and info toasts with the expected variants', () => {
    const successId = service.success('Berhasil', 'Data tersimpan');
    const errorId = service.error('Gagal');
    const infoId = service.info('Info');

    expect(service.toasts().length).toBe(3);
    expect(successId).toBe(1);
    expect(errorId).toBe(2);
    expect(infoId).toBe(3);

    expect(service.toasts()[0]).toMatchObject({
      id: successId,
      title: 'Berhasil',
      description: 'Data tersimpan',
      variant: 'success',
    });
    expect(service.toasts()[1].variant).toBe('error');
    expect(service.toasts()[1].description).toBe('');
    expect(service.toasts()[2].variant).toBe('info');
  });

  it('dismisses a toast by id', () => {
    const firstId = service.success('Satu');
    const secondId = service.warning('Dua');

    service.dismiss(firstId);

    expect(service.toasts().map((toast) => toast.id)).toEqual([secondId]);
    expect(service.toasts()[0].variant).toBe('warning');
  });

  it('auto-dismisses toasts after their duration', () => {
    service.show({ title: 'Sementara', duration: 1000 });

    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(999);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts()).toEqual([]);
  });

  it('keeps toasts with duration 0 until dismissed and updates position', () => {
    service.show({ title: 'Tetap', duration: 0 });
    vi.advanceTimersByTime(10_000);

    expect(service.toasts().length).toBe(1);

    service.setPosition('top-left');
    expect(service.position()).toBe('top-left');
  });
});
