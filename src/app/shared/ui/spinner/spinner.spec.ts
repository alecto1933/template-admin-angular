import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SpinnerSize, UiSpinner } from '@/shared/ui/spinner/spinner';

@Component({
  imports: [UiSpinner],
  template: `<ui-spinner [size]="size()" [label]="label()" />`,
})
class SpinnerHost {
  readonly size = signal<SpinnerSize>('md');
  readonly label = signal('Memuat');
}

describe('UiSpinner', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SpinnerHost] }).compileComponents();
  });

  it('renders a status element with an accessible label and spinning icon', () => {
    const fixture = TestBed.createComponent(SpinnerHost);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('ui-spinner') as HTMLElement;
    const icon = spinner.querySelector('ui-icon') as HTMLElement;

    expect(spinner).toBeTruthy();
    expect(spinner.getAttribute('role')).toBe('status');
    expect(spinner.getAttribute('aria-label')).toBe('Memuat');
    expect(spinner.getAttribute('data-size')).toBe('md');
    expect(icon).toBeTruthy();
    expect(icon.classList.contains('animate-spin')).toBe(true);
  });

  it('reflects size and label input changes', () => {
    const fixture = TestBed.createComponent(SpinnerHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const spinner = fixture.nativeElement.querySelector('ui-spinner') as HTMLElement;

    component.size.set('xl');
    component.label.set('Menyimpan');
    fixture.detectChanges();

    expect(spinner.getAttribute('data-size')).toBe('xl');
    expect(spinner.getAttribute('aria-label')).toBe('Menyimpan');
  });
});
