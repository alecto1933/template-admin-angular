import { TestBed } from '@angular/core/testing';
import { BankRequest, BankRequestDialog, BankRequestTexts } from '@/pages/auth/bank-request-dialog';

const TEXTS: BankRequestTexts = {
  titleCreate: 'Permintaan Bank Baru',
  titleEdit: 'Detail Permintaan Bank',
  warningTitle: 'Perhatian!',
  warning: 'Bank belum terdaftar.',
  fieldName: 'Nama bank',
  fieldCountry: 'Negara',
  fieldRegion: 'Wilayah',
  fieldAddress: 'Alamat',
  fieldBranch: 'Kantor Cabang',
  fieldCity: 'Kota',
  fieldSwift: 'Kode SWIFT',
  swiftHint: '8 atau 11 karakter alfanumerik',
  phName: 'Contoh: Bank Rakyat Contoh',
  phCountry: 'Pilih negara',
  phRegion: 'Contoh: Jawa Barat',
  phAddress: 'Alamat lengkap kantor bank',
  phBranch: 'Contoh: Cabang Bandung',
  phCity: 'Contoh: Bandung',
  phSwift: 'Contoh: ABCDIDJA',
  errRequired: 'Wajib diisi.',
  errAddressMax: 'Maksimal 250 karakter.',
  errSwift: 'Kode SWIFT harus 8 atau 11 karakter alfanumerik.',
  save: 'Simpan',
  cancel: 'Batal',
};

const VALID: Omit<BankRequest, 'id'> = {
  name: 'Bank Contoh',
  countryIso: 'id',
  region: 'Jawa Barat',
  address: 'Jl. Contoh 1',
  branch: 'Cabang Bandung',
  city: 'Bandung',
  swiftCode: 'ABCDIDJA',
};

describe('BankRequestDialog', () => {
  beforeEach(async () => {
    HTMLDialogElement.prototype.showModal = vi.fn() as never;
    HTMLDialogElement.prototype.close = vi.fn() as never;
    await TestBed.configureTestingModule({ imports: [BankRequestDialog] }).compileComponents();
  });

  it('blocks saving when required fields are empty', () => {
    const fixture = TestBed.createComponent(BankRequestDialog);
    fixture.componentRef.setInput('texts', TEXTS);
    fixture.detectChanges();

    const emitted: BankRequest[] = [];
    fixture.componentInstance.saved.subscribe((value) => emitted.push(value));

    const component = fixture.componentInstance as unknown as {
      form: { invalid: boolean };
      save: () => void;
    };
    component.save();

    expect(emitted).toHaveLength(0);
    expect(component.form.invalid).toBe(true);
  });

  it('emits a trimmed request with an uppercased SWIFT code', () => {
    const fixture = TestBed.createComponent(BankRequestDialog);
    fixture.componentRef.setInput('texts', TEXTS);
    fixture.detectChanges();

    const emitted: BankRequest[] = [];
    fixture.componentInstance.saved.subscribe((value) => emitted.push(value));

    const component = fixture.componentInstance as unknown as {
      form: { setValue: (value: Omit<BankRequest, 'id'>) => void; invalid: boolean };
      save: () => void;
    };
    component.form.setValue({ ...VALID, name: '  Bank Contoh  ', swiftCode: 'abcdidja' });
    component.save();

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toMatchObject({ ...VALID, name: 'Bank Contoh', swiftCode: 'ABCDIDJA' });
    expect(emitted[0].id).toMatch(/^bank-request-/);
  });

  it('keeps the id when editing an existing request', () => {
    const fixture = TestBed.createComponent(BankRequestDialog);
    fixture.componentRef.setInput('texts', TEXTS);
    fixture.detectChanges();

    let emitted: BankRequest | null = null;
    fixture.componentInstance.saved.subscribe((value) => (emitted = value));

    const component = fixture.componentInstance as unknown as {
      editingId: { set: (value: string) => void };
      form: { setValue: (value: Omit<BankRequest, 'id'>) => void };
      save: () => void;
    };
    component.editingId.set('bank-request-42');
    component.form.setValue(VALID);
    component.save();

    expect(emitted).not.toBeNull();
    expect((emitted as BankRequest | null)?.id).toBe('bank-request-42');
  });

  it('opens in create mode and in edit mode with prefilled values', () => {
    const fixture = TestBed.createComponent(BankRequestDialog);
    fixture.componentRef.setInput('texts', TEXTS);
    fixture.detectChanges();
    const c = fixture.componentInstance as any;

    c.open();
    fixture.detectChanges();
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(c.title()).toBe(TEXTS.titleCreate);
    expect(c.form.controls.name.value).toBe('');

    c.open({ ...VALID, id: 'bank-request-9' });
    fixture.detectChanges();
    expect(c.title()).toBe(TEXTS.titleEdit);
    expect(c.form.getRawValue()).toMatchObject(VALID);
  });

  it('reports required and SWIFT pattern errors and clamps the SWIFT input to uppercase', () => {
    const fixture = TestBed.createComponent(BankRequestDialog);
    fixture.componentRef.setInput('texts', TEXTS);
    fixture.detectChanges();
    const c = fixture.componentInstance as any;

    c.form.controls.name.markAsTouched();
    expect(c.invalid('name')).toBe(true);
    expect(c.errorFor('name')).toBe(TEXTS.errRequired);

    c.form.controls.swiftCode.setValue('ABC');
    c.form.controls.swiftCode.markAsTouched();
    expect(c.invalid('swiftCode')).toBe(true);
    expect(c.errorFor('swiftCode')).toBe(TEXTS.errSwift);

    const input = document.createElement('input');
    input.value = 'abcdidja';
    c.onSwiftInput({ target: input } as unknown as Event);
    expect(input.value).toBe('ABCDIDJA');
    expect(c.form.controls.swiftCode.value).toBe('ABCDIDJA');
    expect(c.invalid('swiftCode')).toBe(false);
  });

  it('shows validation errors from the rendered dialog when saving an empty form', () => {
    const fixture = TestBed.createComponent(BankRequestDialog);
    fixture.componentRef.setInput('texts', TEXTS);
    fixture.detectChanges();
    const c = fixture.componentInstance as any;
    const emitted: BankRequest[] = [];
    fixture.componentInstance.saved.subscribe((value) => emitted.push(value));

    c.open();
    fixture.detectChanges();

    const save = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => (button.textContent ?? '').trim() === TEXTS.save);
    save?.click();
    fixture.detectChanges();

    expect(emitted).toHaveLength(0);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.ui-error').length).toBe(7);
  });

  it('closes without emitting when cancel is clicked', () => {
    const fixture = TestBed.createComponent(BankRequestDialog);
    fixture.componentRef.setInput('texts', TEXTS);
    fixture.detectChanges();
    const c = fixture.componentInstance as any;
    const emitted: BankRequest[] = [];
    fixture.componentInstance.saved.subscribe((value) => emitted.push(value));
    const close = vi.spyOn(HTMLDialogElement.prototype, 'close');

    c.open();
    fixture.detectChanges();

    const cancel = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => (button.textContent ?? '').trim() === TEXTS.cancel);
    cancel?.click();

    expect(close).toHaveBeenCalled();
    expect(emitted).toHaveLength(0);
  });

  it('flags an overlong address and emits a valid request from the save button', () => {
    const fixture = TestBed.createComponent(BankRequestDialog);
    fixture.componentRef.setInput('texts', TEXTS);
    fixture.detectChanges();
    const c = fixture.componentInstance as any;
    const emitted: BankRequest[] = [];
    fixture.componentInstance.saved.subscribe((value) => emitted.push(value));

    c.open();
    c.form.patchValue({ ...VALID, address: 'x'.repeat(251) });
    c.save();
    expect(c.form.controls.address.hasError('maxlength')).toBe(true);
    expect(emitted).toHaveLength(0);

    c.form.patchValue(VALID);
    fixture.detectChanges();

    const save = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => (button.textContent ?? '').trim() === TEXTS.save);
    save?.click();

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toMatchObject(VALID);
  });
});
