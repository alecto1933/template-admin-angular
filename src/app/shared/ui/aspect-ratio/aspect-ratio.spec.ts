import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiAspectRatio } from '@/shared/ui/aspect-ratio/aspect-ratio';

@Component({
  imports: [UiAspectRatio],
  template: `
    <ui-aspect-ratio id="default"><img alt="foto" /></ui-aspect-ratio>
    <ui-aspect-ratio id="wide" [ratio]="'21 / 9'">Konten</ui-aspect-ratio>
    <ui-aspect-ratio id="square" [ratio]="1">Konten</ui-aspect-ratio>
  `,
})
class AspectRatioHost {}

describe('UiAspectRatio', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AspectRatioHost] }).compileComponents();
  });

  it('renders projected content', () => {
    const fixture = TestBed.createComponent(AspectRatioHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#default') as HTMLElement;

    expect(element.querySelector('img')).not.toBeNull();
    expect(element.classList).toContain('ui-aspect-ratio');
  });

  it('applies the ratio as a host aspect-ratio style', () => {
    const fixture = TestBed.createComponent(AspectRatioHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const wide = host.querySelector('#wide') as HTMLElement;
    const square = host.querySelector('#square') as HTMLElement;

    expect(wide.style.getPropertyValue('aspect-ratio')).toBe('21 / 9');
    // The CSSOM normalizes the bare number 1 to its canonical "1 / 1" form.
    expect(square.style.getPropertyValue('aspect-ratio')).toBe('1 / 1');
  });
});
