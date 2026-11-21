import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiCodeBlock } from '@/shared/ui/code-block/code-block';

@Component({
  imports: [UiCodeBlock],
  template: `
    <ui-code-block
      [code]="code()"
      [showHeader]="true"
      title="app.ts"
      language="ts"
      [showLineNumbers]="true"
      [startLine]="3"
      [highlightLines]="[4]"
      [floatingActions]="true"
    />
  `,
})
class CodeBlockHost {
  readonly code = signal('const a = 1;\n+const b = 2;\n-const c = 3;');
}

describe('UiCodeBlock', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeBlockHost],
    }).compileComponents();
  });

  it('renders header, line numbers, highlight and diff state', () => {
    const fixture = TestBed.createComponent(CodeBlockHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.ui-code-block-header')?.textContent).toContain('app.ts');

    const numbers = [...host.querySelectorAll('.ui-code-line-number')].map((el) =>
      el.textContent?.trim(),
    );
    expect(numbers).toEqual(['3', '4', '5']);

    const lines = host.querySelectorAll<HTMLElement>('.ui-code-line');
    expect(lines).toHaveLength(3);
    expect(lines[1].getAttribute('data-highlight')).toBe('');
    expect(lines[1].getAttribute('data-diff')).toBe('add');
    expect(lines[2].getAttribute('data-diff')).toBe('remove');
    expect(lines[0].getAttribute('data-diff')).toBe('none');
  });

  it('copies the code and shows the copied state', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const fixture = TestBed.createComponent(CodeBlockHost);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Salin kode"]',
    ) as HTMLButtonElement;
    expect(button).toBeTruthy();

    button.click();
    await Promise.resolve();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith('const a = 1;\n+const b = 2;\n-const c = 3;');
    expect(button.getAttribute('aria-label')).toBe('Tersalin');

    if (original) {
      Object.defineProperty(navigator, 'clipboard', original);
    }
  });
});
