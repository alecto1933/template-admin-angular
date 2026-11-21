import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LanguageService } from '@/core/language.service';
import { ToastService } from '@/shared/ui/toast/toast.service';
import { RegisterPage } from '@/pages/auth/register.page';

function host(fixture: { nativeElement: unknown }): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function footerButton(
  fixture: { nativeElement: unknown },
  label: string,
): HTMLButtonElement | undefined {
  return Array.from(host(fixture).querySelectorAll<HTMLButtonElement>('footer button')).find(
    (button) => (button.textContent ?? '').trim() === label,
  );
}

function fakeFile(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size, configurable: true });
  return file;
}

function fileEvent(file: File | null): Event {
  const input = document.createElement('input');
  Object.defineProperty(input, 'files', { value: file ? [file] : [], configurable: true });
  return { target: input } as unknown as Event;
}

class FakeFileReader {
  result = 'data:image/png;base64,AAAA';
  onload: (() => void) | null = null;
  readAsDataURL(): void {
    this.onload?.();
  }
}

const DRAFT_KEY = 'ivendor.register.draft.v1';

const BANK_REQUEST = {
  id: 'bank-request-7',
  name: 'Bank Contoh',
  countryIso: 'sg',
  region: 'Central',
  address: '1 Example Road',
  branch: 'Main',
  city: 'Singapore',
  swiftCode: 'ABCDSGSG',
};

function create(): { fixture: ComponentFixture<RegisterPage>; c: any } {
  const fixture = TestBed.createComponent(RegisterPage);
  fixture.detectChanges();
  return { fixture, c: fixture.componentInstance as any };
}

describe('RegisterPage', () => {
  let showModal: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.classList.remove('dark');
    HTMLDialogElement.prototype.showModal = vi.fn() as never;
    HTMLDialogElement.prototype.close = vi.fn() as never;
    Element.prototype.scrollTo = vi.fn() as never;
    showModal = HTMLDialogElement.prototype.showModal as unknown as ReturnType<typeof vi.fn>;
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = vi.fn(() => 'blob:test');
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn();

    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('renders the three core registration sections in Indonesian', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();

    const body = host(fixture).textContent ?? '';
    expect(body).toContain('Profil Vendor');
    expect(body).toContain('Rekening Bank');
    expect(body).toContain('Identifikasi Pajak');
    expect(host(fixture).querySelectorAll('input[name="entity-type"]')).toHaveLength(3);
  });

  it('translates the section headings when the language changes', () => {
    const language = TestBed.inject(LanguageService);
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();

    language.set('en');
    fixture.detectChanges();
    let body = host(fixture).textContent ?? '';
    expect(body).toContain('Vendor Profile');
    expect(body).toContain('Bank Account');
    expect(body).toContain('Tax Identification');

    language.set('ja');
    fixture.detectChanges();
    body = host(fixture).textContent ?? '';
    expect(body).toContain('ベンダープロフィール');
    expect(body).toContain('銀行口座');
    expect(body).toContain('税務識別情報');
    expect(localStorage.getItem('ivendor-language')).toBe('ja');
  });

  it('blocks submission and flags required fields when the form is empty', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();

    footerButton(fixture, 'Berikutnya')?.click();
    fixture.detectChanges();
    vi.advanceTimersByTime(400);
    fixture.detectChanges();

    const name = host(fixture).querySelector<HTMLInputElement>('#v-name');
    expect(name?.getAttribute('aria-invalid')).toBe('true');
    expect(host(fixture).querySelectorAll('.ui-error').length).toBeGreaterThan(0);
    expect(host(fixture).textContent).toContain('Wajib diisi');

    const component = fixture.componentInstance as unknown as {
      vendorForm: { invalid: boolean; touched: boolean };
    };
    expect(component.vendorForm.invalid).toBe(true);
    vi.useRealTimers();
  });

  it('opens the cancel-confirmation dialog from the footer', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();

    expect(showModal).not.toHaveBeenCalled();
    footerButton(fixture, 'Batalkan')?.click();
    fixture.detectChanges();

    expect(showModal).toHaveBeenCalledTimes(1);
    expect(host(fixture).textContent).toContain('Batalkan registrasi?');
  });

  it('resets vendor data when confirming an entity-type change and applies government mode', () => {
    const { fixture, c } = create();
    const toast = TestBed.inject(ToastService);
    const info = vi.spyOn(toast, 'info');

    c.requestEntityType('national');
    expect(showModal).not.toHaveBeenCalled();

    c.requestEntityType('international');
    expect(c.confirmKind()).toBe('type');
    expect(showModal).toHaveBeenCalled();
    fixture.detectChanges();
    expect(host(fixture).textContent).toContain('Ubah jenis perusahaan?');

    c.cancelConfirmation();
    expect(c.pendingEntityType()).toBe('international');

    c.confirmAction();
    expect(c.entityType()).toBe('international');
    expect(c.vendorForm.controls.vendorCountry.hasError('required')).toBe(true);
    expect(info).toHaveBeenCalledWith('Data direset', expect.any(String));
    c.onConfirmClosed();
    expect(c.confirmKind()).toBeNull();
    expect(c.pendingEntityType()).toBeNull();

    c.requestEntityType('government');
    c.confirmAction();
    expect(c.entityType()).toBe('government');
    expect(c.vendorForm.controls.type.value).toBe('GOVERNMENT');
    expect(c.vendorForm.controls.type.disabled).toBe(true);
    expect(c.vendorType()).toBe('GOVERNMENT');

    c.requestEntityType('national');
    c.confirmAction();
    expect(c.entityType()).toBe('national');
    expect(c.vendorForm.controls.type.enabled).toBe(true);
    expect(c.vendorForm.controls.type.value).toBe('');
  });

  it('clears the draft and navigates to login after confirming cancellation', () => {
    const { c } = create();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    sessionStorage.setItem(DRAFT_KEY, '{}');

    c.openCancelConfirm();
    expect(c.confirmTitle()).toContain('Batalkan');
    c.confirmAction();

    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('filters and selects dial countries, then persists the selection', () => {
    vi.useFakeTimers();
    const { c } = create();

    c.openCountry();
    expect(showModal).toHaveBeenCalled();

    c.countryQuery.set('sing');
    expect(c.filteredCountries().map((country: { iso: string }) => country.iso)).toEqual(['sg']);

    c.countryQuery.set('+62');
    expect(c.filteredCountries()[0].iso).toBe('id');

    c.countryQuery.set('');
    expect(c.filteredCountries()).toHaveLength(12);

    c.chooseCountry({ iso: 'sg', dial: '+65', name: 'Singapura', nameEn: 'Singapore' });
    expect(c.selectedCountry().iso).toBe('sg');
    expect(c.bankCountryLabel('sg')).toBe('Singapura');
    expect(c.bankCountryLabel('zz')).toBe('zz');
    expect(c.countryName(c.selectedCountry())).toBe('Singapura');

    vi.advanceTimersByTime(400);
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}');
    expect(draft.phoneCountryIso).toBe('sg');
  });

  it('switches the language through the page handler', () => {
    const { fixture, c } = create();

    c.setLang('en');
    fixture.detectChanges();
    expect(host(fixture).textContent).toContain('Vendor Profile');
    expect(c.t().next).toBe('Next');

    c.setLang('id');
    fixture.detectChanges();
    expect(host(fixture).textContent).toContain('Profil Vendor');
  });

  it('searches, selects, creates, edits and deletes bank requests', () => {
    vi.useFakeTimers();
    const { c } = create();
    const toast = TestBed.inject(ToastService);
    const success = vi.spyOn(toast, 'success');
    const info = vi.spyOn(toast, 'info');

    c.searchBanks('');
    expect(c.bankResults()).toEqual([]);
    expect(c.bankLoading()).toBe(false);

    c.searchBanks('mandiri');
    expect(c.bankLoading()).toBe(true);
    vi.advanceTimersByTime(300);
    expect(c.bankLoading()).toBe(false);
    expect(c.bankResults()).toHaveLength(2);

    c.vendorForm.controls.bankName.setValue('bca-id-jkt');
    expect(c.selectedBank()?.name).toContain('BCA');
    c.vendorForm.controls.bankName.setValue('');
    expect(c.selectedBank()).toBeNull();

    c.openBankRequest();
    expect(showModal).toHaveBeenCalledTimes(1);
    c.onBankRequestSaved(BANK_REQUEST);
    expect(c.bankRequest()).toEqual(BANK_REQUEST);
    expect(c.bankResults()[0]).toMatchObject({ value: BANK_REQUEST.id, label: BANK_REQUEST.name });
    expect(c.vendorForm.controls.bankName.value).toBe(BANK_REQUEST.id);
    expect(success).toHaveBeenCalledWith('Permintaan bank disimpan', expect.any(String));

    c.editBankRequest();
    expect(showModal).toHaveBeenCalledTimes(2);

    c.confirmDeleteBankRequest();
    expect(showModal).toHaveBeenCalledTimes(3);
    c.deleteBankRequest();
    expect(c.bankRequest()).toBeNull();
    expect(c.bankResults()).toEqual([]);
    expect(c.vendorForm.controls.bankName.value).toBe('');
    expect(info).toHaveBeenCalledWith('Permintaan bank dihapus', expect.any(String));
  });

  it('validates tax file type/size and uploads PDF or image documents', () => {
    vi.useFakeTimers();
    vi.stubGlobal('FileReader', FakeFileReader);
    const { c } = create();
    const input = c.taxFileInput().nativeElement as HTMLInputElement;
    const click = vi.spyOn(input, 'click').mockImplementation(() => {});

    c.pickTaxFile('ktp');
    expect(click).toHaveBeenCalled();

    c.onTaxFileSelected(fileEvent(null));
    expect(c.taxFiles().ktp).toBeNull();

    c.onTaxFileSelected(fileEvent(fakeFile('catatan.txt', 'text/plain', 10)));
    expect(c.taxFileError().ktp).toContain('Format');

    c.onTaxFileSelected(fileEvent(fakeFile('besar.pdf', 'application/pdf', 6 * 1024 * 1024)));
    expect(c.taxFileError().ktp).toContain('Ukuran');

    c.onTaxFileSelected(fileEvent(fakeFile('ktp.pdf', 'application/pdf', 2048)));
    expect(c.taxFileError().ktp).toBeNull();
    expect(c.taxFiles().ktp).toMatchObject({ icon: 'file-text', pdfUrl: 'blob:test' });
    expect(c.vendorForm.controls.ktpAttachment.value).toBe('ktp.pdf');
    expect(c.taxUploading().ktp).toBe(true);

    vi.advanceTimersByTime(180 * 5);
    expect(c.taxProgress().ktp).toBe(100);
    expect(c.taxUploading().ktp).toBe(false);

    c.openTaxPreview('ktp');
    expect(showModal).toHaveBeenCalled();

    c.pickTaxFile('sppkp');
    c.onTaxFileSelected(fileEvent(fakeFile('foto.png', 'image/png', 2048)));
    expect(c.taxFiles().sppkp).toMatchObject({ icon: 'image', pdfUrl: null });
    expect(c.taxFiles().sppkp.image).toContain('data:image/png');

    c.pickTaxFile('skb');
    c.onTaxFileSelected(fileEvent(fakeFile('skb.pdf', 'application/pdf', 1024)));
    c.pickTaxFile('domicile');
    c.onTaxFileSelected(fileEvent(fakeFile('domisili.pdf', 'application/pdf', 1024)));
    expect(c.taxFiles().skb).not.toBeNull();
    expect(c.taxFiles().domicile).not.toBeNull();

    c.openTaxPreview('domicile');
    expect(showModal).toHaveBeenCalledTimes(2);

    c.removeTaxFile('ktp');
    c.removeTaxFile('sppkp');
    c.removeTaxFile('skb');
    c.removeTaxFile('domicile');
    expect(c.taxFiles().ktp).toBeNull();
    expect(c.taxFiles().domicile).toBeNull();
    expect(c.vendorForm.controls.ktpAttachment.value).toBe('');
  });

  it('validates and uploads the bank statement, formats sizes and previews it', () => {
    vi.useFakeTimers();
    vi.stubGlobal('FileReader', FakeFileReader);
    const { c } = create();
    const bankInput = c.bankFileInput().nativeElement as HTMLInputElement;
    const click = vi.spyOn(bankInput, 'click').mockImplementation(() => {});

    c.openBankFilePicker();
    expect(click).toHaveBeenCalled();

    c.onBankFileSelected(fileEvent(null));
    expect(c.bankFile()).toBeNull();

    c.onBankFileSelected(fileEvent(fakeFile('statement.txt', 'text/plain', 10)));
    expect(c.bankFileError()).toContain('Format');

    c.onBankFileSelected(fileEvent(fakeFile('besar.pdf', 'application/pdf', 6 * 1024 * 1024)));
    expect(c.bankFileError()).toContain('Ukuran');

    c.onBankFileSelected(fileEvent(fakeFile('statement.pdf', 'application/pdf', 1536 * 1024)));
    expect(c.bankFileError()).toBeNull();
    expect(c.bankFile()?.meta).toContain('MB');
    expect(c.vendorForm.controls.bankStatement.value).toBe('statement.pdf');
    expect(c.bankFileUploading()).toBe(true);
    vi.advanceTimersByTime(180 * 5);
    expect(c.bankFileProgress()).toBe(100);
    expect(c.bankFileUploading()).toBe(false);

    c.openBankPreview();
    expect(showModal).toHaveBeenCalled();

    c.removeBankFile();
    expect(c.bankFile()).toBeNull();
    expect(c.vendorForm.controls.bankStatement.value).toBe('');

    c.onBankFileSelected(fileEvent(fakeFile('memo', 'application/pdf', 512)));
    expect(c.bankFile()?.meta.startsWith('FILE')).toBe(true);
    expect(c.bankFile()?.meta).toContain('KB');

    c.removeBankFile();
    c.onBankFileSelected(fileEvent(fakeFile('scan.png', 'image/png', 2048)));
    expect(c.bankFile()?.image).toContain('data:image/png');
    c.openBankPreview();
    expect(showModal).toHaveBeenCalledTimes(2);
    c.removeBankFile();
  });

  it('toggles vendor-name reuse and the SKB requirement, and downloads the template', () => {
    vi.useFakeTimers();
    const { c } = create();
    const toast = TestBed.inject(ToastService);
    const info = vi.spyOn(toast, 'info');

    c.downloadDomicileTemplate();
    expect(info).toHaveBeenCalledWith('Unduh Template', expect.any(String));

    c.vendorForm.controls.name.setValue('PT Contoh');
    c.toggleUseVendorName(true);
    expect(c.useVendorName()).toBe(true);
    expect(c.vendorForm.controls.taxName.value).toBe('PT Contoh');
    expect(c.vendorForm.controls.taxName.disabled).toBe(true);

    c.vendorForm.controls.name.setValue('PT Contoh Baru');
    expect(c.vendorForm.controls.taxName.value).toBe('PT Contoh Baru');

    c.toggleUseVendorName(false);
    expect(c.useVendorName()).toBe(false);
    expect(c.vendorForm.controls.taxName.enabled).toBe(true);

    c.toggleSkb(true);
    expect(c.hasSkb()).toBe(true);
    expect(c.vendorForm.controls.skbAttachment.hasError('required')).toBe(true);

    c.toggleSkb(false);
    expect(c.hasSkb()).toBe(false);
    expect(c.vendorForm.controls.skbAttachment.errors).toBeNull();

    vi.advanceTimersByTime(400);
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}');
    expect(draft.useVendorName).toBe(false);
    expect(draft.hasSkb).toBe(false);
  });

  it('persists a draft without secrets and restores it on the next visit', () => {
    vi.useFakeTimers();
    const first = create();
    first.c.vendorForm.patchValue({
      name: 'PT Draft',
      type: 'CORPORATE',
      category: 'Farmasi',
      email: 'draft@example.com',
      password: 'rahasia123',
      confirmPassword: 'rahasia123',
      bankName: 'bca-id-jkt',
    });
    first.c.useVendorName.set(true);
    first.c.hasSkb.set(true);
    first.c.bankRequest.set(BANK_REQUEST);
    first.c.chooseCountry({ iso: 'sg', dial: '+65', name: 'Singapura', nameEn: 'Singapore' });
    first.c.persistDraft();

    const raw = sessionStorage.getItem(DRAFT_KEY) ?? '';
    expect(raw).not.toContain('rahasia123');
    const draft = JSON.parse(raw);
    expect(draft).toMatchObject({
      version: 1,
      entityType: 'national',
      phoneCountryIso: 'sg',
      useVendorName: true,
      hasSkb: true,
      bankRequest: BANK_REQUEST,
    });

    const second = create();
    expect(second.c.vendorForm.controls.name.value).toBe('PT Draft');
    expect(second.c.vendorForm.controls.email.value).toBe('draft@example.com');
    expect(second.c.vendorForm.controls.password.value).toBe('');
    expect(second.c.selectedCountry().iso).toBe('sg');
    expect(second.c.useVendorName()).toBe(true);
    expect(second.c.vendorForm.controls.taxName.disabled).toBe(true);
    expect(second.c.hasSkb()).toBe(true);
    expect(second.c.vendorForm.controls.skbAttachment.hasError('required')).toBe(true);
    expect(second.c.bankRequest()).toEqual(BANK_REQUEST);
    expect(second.c.bankResults()[0].value).toBe(BANK_REQUEST.id);

    sessionStorage.setItem(DRAFT_KEY, '{not-json');
    expect(() => create()).not.toThrow();
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 2 }));
    expect(() => create()).not.toThrow();
  });

  it('restores a draft that references a known bank without a custom request', () => {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        version: 1,
        entityType: 'national',
        values: { name: 'PT Bank', bankName: 'bca-id-jkt' },
        phoneCountryIso: 'id',
        useVendorName: false,
        hasSkb: false,
        bankRequest: null,
      }),
    );

    const { c } = create();
    expect(c.selectedBank()?.id).toBe('bca-id-jkt');
    expect(c.bankRequest()).toBeNull();
  });

  it('blocks next() for invalid data, flags mismatched passwords and scrolls to the first error', () => {
    vi.useFakeTimers();
    const { fixture, c } = create();
    const toast = TestBed.inject(ToastService);
    const success = vi.spyOn(toast, 'success');

    c.vendorForm.patchValue({ password: 'rahasia123', confirmPassword: 'berbeda123' });
    c.vendorForm.controls.confirmPassword.markAsTouched();
    fixture.detectChanges();
    expect(c.passwordMismatch()).toBe(true);
    expect(host(fixture).textContent).toContain('Konfirmasi kata sandi tidak cocok');

    c.next();
    expect(success).not.toHaveBeenCalled();
    expect(c.vendorForm.touched).toBe(true);
    vi.advanceTimersByTime(400);

    expect(c.fieldInvalid('name')).toBe(true);
    expect(c.fieldInvalid('unknown')).toBe(false);
  });

  it('submits a complete form, clears the draft and shows a success toast', () => {
    const { c } = create();
    const toast = TestBed.inject(ToastService);
    const success = vi.spyOn(toast, 'success');
    sessionStorage.setItem(DRAFT_KEY, '{}');

    c.vendorForm.patchValue({
      name: 'PT Lengkap',
      type: 'CORPORATE',
      category: 'Farmasi',
      address: 'Jl. Contoh 1',
      email: 'vendor@example.com',
      password: 'rahasia123',
      confirmPassword: 'rahasia123',
      picName: 'Raka',
      picEmail: 'raka@example.com',
      phone: '08123456789',
      bankName: 'bca-id-jkt',
      bankAccountName: 'PT Lengkap',
      bankAccountNumber: '1234567890',
      currency: 'IDR - Rupiah Indonesia',
      recipientType: 'CORPORATE',
      bankStatement: 'statement.pdf',
      taxId: '01.234.567.8-901.000',
      taxName: 'PT Lengkap',
      taxAddress: 'Jl. Pajak 2',
      ktpAttachment: 'ktp.pdf',
    });
    expect(c.vendorForm.valid).toBe(true);

    c.next();

    expect(success).toHaveBeenCalledWith('Profil vendor lengkap', expect.any(String));
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('navigates back to login from cancel()', () => {
    const { c } = create();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    sessionStorage.setItem(DRAFT_KEY, '{}');

    c.cancel();

    expect(navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
  });
});
