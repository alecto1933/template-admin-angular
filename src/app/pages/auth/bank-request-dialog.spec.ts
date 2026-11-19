import { TestBed } from '@angular/core/testing';
import { BankRequest, BankRequestDialog, BankRequestTexts } from './bank-request-dialog';

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
  errRequired: 'Wajib diisi.',
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
    HTMLDialogElement.prototype.showModal = () => {};
    HTMLDialogElement.prototype.close = () => {};
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
});
