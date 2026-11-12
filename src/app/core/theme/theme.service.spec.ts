import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
  });

  it('defaults to light mode and toggles', () => {
    const service = TestBed.inject(ThemeService);

    service.set('light');
    expect(service.theme()).toBe('light');
    expect(service.isDark()).toBe(false);

    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('can set an explicit theme', () => {
    const service = TestBed.inject(ThemeService);

    service.set('dark');
    expect(service.isDark()).toBe(true);

    service.set('light');
    expect(service.isDark()).toBe(false);
  });
});
