import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CommandItem, UiCommand } from '@/shared/ui/command/command';

@Component({
  imports: [UiCommand],
  template: `<ui-command [items]="items" (selected)="lastSelected.set($event)" />`,
})
class CommandHost {
  readonly lastSelected = signal<CommandItem | null>(null);
  readonly items: CommandItem[] = [
    { id: 'new', label: 'Buat pesanan', group: 'Aksi', keywords: 'tambah order' },
    { id: 'open', label: 'Buka pengaturan', group: 'Aksi' },
    { id: 'disabled', label: 'Hapus semua', group: 'Berbahaya', disabled: true },
    { id: 'help', label: 'Bantuan', group: 'Lainnya' },
  ];
}

describe('UiCommand', () => {
  beforeEach(async () => {
    Element.prototype.scrollIntoView = vi.fn();
    await TestBed.configureTestingModule({ imports: [CommandHost] }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders grouped items and the empty state', () => {
    const fixture = TestBed.createComponent(CommandHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('[role="option"]')).toHaveLength(4);
    expect(host.querySelectorAll('.ui-command-group')).toHaveLength(3);

    const input = host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    input.value = 'zzz';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(host.querySelectorAll('[role="option"]')).toHaveLength(0);
    expect(host.querySelector('.ui-command-empty')?.textContent).toContain(
      'Tidak ada perintah ditemukan',
    );
  });

  it('filters items by label and keywords', () => {
    const fixture = TestBed.createComponent(CommandHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector<HTMLInputElement>('input[role="combobox"]')!;

    input.value = 'pesanan';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(host.querySelectorAll('[role="option"]')).toHaveLength(1);

    input.value = 'tambah';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    const options = host.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toContain('Buat pesanan');
  });

  it('emits the selected item via keyboard navigation', () => {
    const fixture = TestBed.createComponent(CommandHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector<HTMLInputElement>('input[role="combobox"]')!;

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toContain('option-0');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.lastSelected()?.id).toBe('new');
  });

  it('skips disabled items and clears the query on escape', () => {
    const fixture = TestBed.createComponent(CommandHost);
    fixture.detectChanges();

    const instance = fixture.debugElement.children[0].componentInstance as UiCommand;
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector<HTMLInputElement>('input[role="combobox"]')!;

    input.value = 'a';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect((instance as unknown as { query: () => string }).query()).toBe('');
    expect(input.value).toBe('');

    const options = host.querySelectorAll<HTMLButtonElement>('[role="option"]');
    options[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lastSelected()).toBeNull();
  });
});
