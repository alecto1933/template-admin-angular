import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { UiButton } from '../../shared/ui/button/button';
import { UiAutocomplete } from '../../shared/ui/autocomplete/autocomplete';
import { UiAttachment } from '../../shared/ui/attachment/attachment';
import { UiDialog } from '../../shared/ui/dialog/dialog';
import { SelectOption, UiSelect } from '../../shared/ui/select/select';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiSwitch } from '../../shared/ui/switch/switch';
import { ToastService } from '../../shared/ui/toast/toast.service';

type Language = 'id' | 'en';
type EntityType = 'national' | 'international' | 'government';
type TaxFileKind = 'ktp' | 'sppkp' | 'skb';

interface UploadFile {
  name: string;
  meta: string;
  image: string | null;
  pdfUrl: string | null;
  icon: 'image' | 'file-text';
}

interface Country {
  iso: string;
  dial: string;
  name: string;
  nameEn: string;
}

const COUNTRIES: Country[] = [
  { iso: 'id', dial: '+62', name: 'Indonesia', nameEn: 'Indonesia' },
  { iso: 'my', dial: '+60', name: 'Malaysia', nameEn: 'Malaysia' },
  { iso: 'sg', dial: '+65', name: 'Singapura', nameEn: 'Singapore' },
  { iso: 'th', dial: '+66', name: 'Thailand', nameEn: 'Thailand' },
  { iso: 'ph', dial: '+63', name: 'Filipina', nameEn: 'Philippines' },
  { iso: 'vn', dial: '+84', name: 'Vietnam', nameEn: 'Vietnam' },
  { iso: 'jp', dial: '+81', name: 'Jepang', nameEn: 'Japan' },
  { iso: 'kr', dial: '+82', name: 'Korea Selatan', nameEn: 'South Korea' },
  { iso: 'us', dial: '+1', name: 'Amerika Serikat', nameEn: 'United States' },
  { iso: 'gb', dial: '+44', name: 'Inggris', nameEn: 'United Kingdom' },
  { iso: 'au', dial: '+61', name: 'Australia', nameEn: 'Australia' },
  { iso: 'in', dial: '+91', name: 'India', nameEn: 'India' },
];

const CATEGORIES = [
  'Farmasi',
  'Alat Kesehatan',
  'Distributor',
  'Manufaktur',
  'Logistik',
  'Jasa Konsultasi',
  'Teknologi Informasi',
];

interface BankInfo {
  id: string;
  name: string;
  country: string;
  branch: string;
}

const BANKS: BankInfo[] = [
  { id: 'mandiri-id-jkt', name: 'Bank Mandiri', country: 'ID', branch: 'Jakarta Pusat' },
  { id: 'mandiri-sg-sg', name: 'Bank Mandiri', country: 'SG', branch: 'Singapore' },
  { id: 'bca-id-jkt', name: 'Bank Central Asia (BCA)', country: 'ID', branch: 'Jakarta Pusat' },
  { id: 'bni-id-jkt', name: 'Bank Negara Indonesia (BNI)', country: 'ID', branch: 'Jakarta Barat' },
  { id: 'bri-id-sby', name: 'Bank Rakyat Indonesia (BRI)', country: 'ID', branch: 'Surabaya' },
  { id: 'cimb-id-jkt', name: 'Bank CIMB Niaga', country: 'ID', branch: 'Jakarta Selatan' },
  { id: 'permata-id-jkt', name: 'Bank Permata', country: 'ID', branch: 'Jakarta Pusat' },
  { id: 'danamon-id-bdg', name: 'Bank Danamon', country: 'ID', branch: 'Bandung' },
  { id: 'btn-id-jkt', name: 'Bank Tabungan Negara (BTN)', country: 'ID', branch: 'Jakarta Pusat' },
];

const CURRENCIES = [
  'IDR - Rupiah Indonesia',
  'USD - US Dollar',
  'SGD - Singapore Dollar',
  'EUR - Euro',
  'JPY - Japanese Yen',
  'GBP - Pound Sterling',
  'AUD - Australian Dollar',
];

const RECIPIENT_TYPES = ['CORPORATE', 'INDIVIDUAL', 'GOVERNMENT'];

const passwordsMatch = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirmation = group.get('confirmPassword')?.value;
  return password && confirmation && password !== confirmation ? { passwordMismatch: true } : null;
};

const TEXTS = {
  id: {
    entityNational: 'Perusahaan Indonesia',
    entityInternational: 'Perusahaan Non Indonesia',
    entityGovernment: 'Pemerintahan',
    placeholder: 'Konten akan ditambahkan di sini.',
    contentLabel: 'Konten',
    cancel: 'Batalkan',
    next: 'Berikutnya',
    languageAria: 'Bahasa: Indonesia',
    themeLight: 'Aktifkan mode terang',
    themeDark: 'Aktifkan mode gelap',
    nextTitle: 'Langkah berikutnya',
    nextMessage: 'Form langkah berikutnya belum tersedia pada demo ini.',
    profileTitle: 'Profil Vendor',
    fieldVendorName: 'Nama',
    phVendorName: 'Nama perusahaan atau perorangan',
    helpVendorName:
      'Jangan menggunakan nama PT/CV/UD untuk perusahaan dan jangan mencantumkan gelar untuk perorangan.',
    fieldType: 'Tipe',
    typePlaceholder: 'Pilih tipe',
    typeCorporate: 'CORPORATE',
    typeIndividual: 'INDIVIDUAL',
    typeGovernment: 'GOVERNMENT',
    fieldCategory: 'Kategori Data',
    categoryPlaceholder: 'Pilih kategori',
    fieldAddress: 'Alamat, mengacu pada NPWP',
    helpAddress: 'Maksimal 250 karakter',
    fieldEmail: 'Alamat Email untuk Mendaftar',
    phAddress: 'Alamat sesuai NPWP',
    phEmail: 'nama@perusahaan.com',
    notesTitle: '*) Catatan',
    note1: 'Alamat email akan digunakan sebagai NAMA PENGGUNA',
    note2: 'Untuk Perusahaan, mohon jangan menggunakan alamat email karyawan',
    note3: '1 (Satu) alamat email hanya digunakan untuk 1 perusahaan atau 1 badan saja',
    note4: 'Alamat Email yang didaftarkan akan digunakan untuk komunikasi dan selalu aktif',
    fieldPassword: 'Kata Sandi',
    phPassword: 'Minimal 8 karakter',
    fieldConfirmPassword: 'Konfirmasi Kata Sandi',
    phConfirmPassword: 'Ulangi kata sandi',
    passwordHint: 'Minimal 8 karakter.',
    picTitle: 'Informasi PIC',
    fieldPicName: 'Nama',
    phPicName: 'Nama PIC',
    fieldPicEmail: 'Email',
    phPicEmail: 'email.pic@perusahaan.com',
    fieldPhone: 'Nomor Telepon',
    phonePlaceholder: '8123456789',
    countryTitle: 'Pilih Kode Negara',
    countrySearch: 'Cari negara…',
    countryEmpty: 'Negara tidak ditemukan',
    errRequired: 'Wajib diisi.',
    errEmail: 'Masukkan email yang valid.',
    errPasswordMin: 'Kata sandi minimal 8 karakter.',
    errPasswordMatch: 'Konfirmasi kata sandi tidak cocok.',
    errAddressMax: 'Maksimal 250 karakter.',
    bankTitle: 'Rekening Bank',
    fieldBankName: 'Nama Bank',
    bankPlaceholder: 'Cari bank…',
    bankEmptyText: 'Bank tidak ditemukan',
    bankHintText: 'Ketik untuk mencari bank…',
    bankInfoCountry: 'Kode Negara',
    bankInfoBranch: 'Cabang',
    fieldAccountName: 'Atas Nama',
    phAccountName: 'Nama sesuai rekening',
    helpAccountName: 'Nama lengkap seperti yang ditampilkan di halaman pertama rekening bank',
    fieldAccountNumber: 'Nomor Rekening',
    phAccountNumber: '1234567890',
    fieldCurrency: 'Mata Uang',
    currencyPlaceholder: 'Pilih mata uang',
    fieldRecipientType: 'Tipe Penerima',
    recipientPlaceholder: 'Pilih tipe penerima',
    fieldBankStatement: 'Lampirkan halaman pertama Rekening Bank',
    uploadHint: 'Klik untuk mengunggah berkas',
    uploadFormat: 'Format Berkas: (JPG, PNG, PDF) Ukuran Maksimal: 5Mb',
    removeFile: 'Hapus berkas',
    previewFile: 'Pratinjau berkas',
    fullScreen: 'Layar penuh',
    exitFullScreen: 'Keluar layar penuh',
    errFileType: 'Format berkas harus JPG, PNG, atau PDF.',
    errFileSize: 'Ukuran berkas maksimal 5 MB.',
    taxTitle: 'Identifikasi Pajak',
    taxDocKtp: 'KTP',
    taxDocNpwp: 'NPWP',
    taxNameKtp: 'Nama KTP',
    taxNameNpwp: 'Nama NPWP',
    taxAddressKtp: 'Alamat KTP',
    taxAddressNpwp: 'Alamat NPWP',
    taxAttachKtp: 'Lampirkan KTP',
    taxAttachNpwp: 'Lampirkan NPWP',
    useVendorNamePrefix: 'Gunakan Nama Vendor sebagai',
    fieldSppkp: 'SPPKP',
    taxAttachSppkp: 'Lampirkan SPPKP',
    taxSkbToggle: 'Jika Anda memiliki Nomor SKB, centang di sini',
    taxAttachSkb: 'Lampirkan SKB',
    phTaxId: 'Nomor identitas',
    phAddressKtp: 'Alamat sesuai KTP',
    phAddressNpwp: 'Alamat sesuai NPWP',
    phTaxName: 'Nama sesuai dokumen',
    phSppkp: 'Nomor SPPKP',
    cancelConfirmTitle: 'Batalkan registrasi?',
    cancelConfirmMessage: 'Data yang sudah diisi akan hilang.',
    typeConfirmTitle: 'Ubah jenis perusahaan?',
    typeConfirmMessage: 'Mengubah pilihan akan mereset semua data yang sudah diisi.',
    no: 'Tidak',
    yesCancel: 'Ya, batalkan',
    yesChange: 'Ya, ubah',
    dataResetTitle: 'Data direset',
    dataResetMessage: 'Semua isian telah dikosongkan karena jenis perusahaan berubah.',
    profileSavedTitle: 'Profil vendor lengkap',
    profileSavedMessage: 'Semua data wajib sudah terisi dengan benar.',
  },
  en: {
    entityNational: 'Indonesian Company',
    entityInternational: 'Non-Indonesian Company',
    entityGovernment: 'Government',
    placeholder: 'Content will be added here.',
    contentLabel: 'Content',
    cancel: 'Cancel',
    next: 'Next',
    languageAria: 'Language: English',
    themeLight: 'Switch to light mode',
    themeDark: 'Switch to dark mode',
    nextTitle: 'Next step',
    nextMessage: 'The next step form is not available in this demo yet.',
    profileTitle: 'Vendor Profile',
    fieldVendorName: 'Name',
    phVendorName: 'Company or individual name',
    helpVendorName:
      'Do not use PT/CV/UD in the company name and do not include titles for individuals.',
    fieldType: 'Type',
    typePlaceholder: 'Select type',
    typeCorporate: 'CORPORATE',
    typeIndividual: 'INDIVIDUAL',
    typeGovernment: 'GOVERNMENT',
    fieldCategory: 'Data Category',
    categoryPlaceholder: 'Select category',
    fieldAddress: 'Address, according to NPWP',
    helpAddress: 'Maximum 250 characters',
    fieldEmail: 'Registration Email Address',
    phAddress: 'Address according to NPWP',
    phEmail: 'name@company.com',
    notesTitle: '*) Notes',
    note1: 'Email address will be used as USERNAME',
    note2: 'For Company, please do not use employee email address',
    note3: '1 (One) email address is only used for 1 company or 1 entity',
    note4: 'Registered Email address will be used for communication and always active',
    fieldPassword: 'Password',
    phPassword: 'At least 8 characters',
    fieldConfirmPassword: 'Confirm Password',
    phConfirmPassword: 'Repeat password',
    passwordHint: 'At least 8 characters.',
    picTitle: 'PIC Information',
    fieldPicName: 'Name',
    phPicName: 'PIC name',
    fieldPicEmail: 'Email',
    phPicEmail: 'pic.email@company.com',
    fieldPhone: 'Phone Number',
    phonePlaceholder: '8123456789',
    countryTitle: 'Select Country Code',
    countrySearch: 'Search country…',
    countryEmpty: 'Country not found',
    errRequired: 'Required.',
    errEmail: 'Enter a valid email address.',
    errPasswordMin: 'Password must be at least 8 characters.',
    errPasswordMatch: 'Passwords do not match.',
    errAddressMax: 'Maximum 250 characters.',
    bankTitle: 'Bank Account',
    fieldBankName: 'Bank Name',
    bankPlaceholder: 'Search bank…',
    bankEmptyText: 'Bank not found',
    bankHintText: 'Type to search for a bank…',
    bankInfoCountry: 'Country Code',
    bankInfoBranch: 'Branch',
    fieldAccountName: 'Account Name',
    phAccountName: 'Name on the account',
    helpAccountName: 'Full name as shown on the first page of the bank statement',
    fieldAccountNumber: 'Account Number',
    phAccountNumber: '1234567890',
    fieldCurrency: 'Currency',
    currencyPlaceholder: 'Select currency',
    fieldRecipientType: 'Recipient Type',
    recipientPlaceholder: 'Select recipient type',
    fieldBankStatement: 'Attach the first page of the Bank Account',
    uploadHint: 'Click to upload a file',
    uploadFormat: 'File Format: (JPG, PNG, PDF) Maximum Size: 5Mb',
    removeFile: 'Remove file',
    previewFile: 'Preview file',
    fullScreen: 'Full screen',
    exitFullScreen: 'Exit full screen',
    errFileType: 'File must be JPG, PNG, or PDF.',
    errFileSize: 'Maximum file size is 5 MB.',
    taxTitle: 'Tax Identification',
    taxDocKtp: 'KTP',
    taxDocNpwp: 'NPWP',
    taxNameKtp: 'KTP Name',
    taxNameNpwp: 'NPWP Name',
    taxAddressKtp: 'KTP Address',
    taxAddressNpwp: 'NPWP Address',
    taxAttachKtp: 'Attach KTP',
    taxAttachNpwp: 'Attach NPWP',
    useVendorNamePrefix: 'Use Vendor Name as',
    fieldSppkp: 'SPPKP',
    taxAttachSppkp: 'Attach SPPKP',
    taxSkbToggle: 'If you have an SKB Number, tick here',
    taxAttachSkb: 'Attach SKB',
    phTaxId: 'Identity number',
    phAddressKtp: 'Address according to KTP',
    phAddressNpwp: 'Address according to NPWP',
    phTaxName: 'Name on document',
    phSppkp: 'SPPKP number',
    cancelConfirmTitle: 'Cancel registration?',
    cancelConfirmMessage: 'Entered data will be lost.',
    typeConfirmTitle: 'Change company type?',
    typeConfirmMessage: 'Changing the selection will reset all entered data.',
    no: 'No',
    yesCancel: 'Yes, cancel',
    yesChange: 'Yes, change',
    dataResetTitle: 'Data reset',
    dataResetMessage: 'All fields were cleared because the company type changed.',
    profileSavedTitle: 'Vendor profile complete',
    profileSavedMessage: 'All required data has been filled in correctly.',
  },
} as const;

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    UiAutocomplete,
    UiAttachment,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    UiButton,
    UiDialog,
    UiIcon,
    UiSelect,
    UiSwitch,
  ],
  templateUrl: './register.page.html',
})
export class RegisterPage {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly theme = inject(ThemeService);
  protected readonly lang = signal<Language>('id');
  protected readonly t = computed(() => TEXTS[this.lang()]);

  protected readonly entityType = signal<EntityType>('national');
  protected readonly vendorType = signal('');
  protected readonly categories = CATEGORIES;
  protected readonly categoryOptions: SelectOption[] = CATEGORIES.map((category) => ({
    value: category,
    label: category,
  }));
  protected readonly bankOptions: SelectOption[] = BANKS.map((bank) => ({
    value: bank.id,
    label: bank.name,
    description: `${bank.country} · ${bank.branch}`,
  }));
  protected readonly selectedBank = signal<BankInfo | null>(null);
  protected readonly bankResults = signal<SelectOption[]>([]);
  protected readonly bankQuery = signal('');
  protected readonly bankLoading = signal(false);
  private bankSearchTimer?: ReturnType<typeof setTimeout>;
  protected readonly currencyOptions: SelectOption[] = CURRENCIES.map((currency) => ({
    value: currency,
    label: currency,
  }));
  protected readonly recipientOptions: SelectOption[] = RECIPIENT_TYPES.map((type) => ({
    value: type,
    label: type,
  }));

  protected readonly bankFile = signal<{
    name: string;
    meta: string;
    image: string | null;
    pdfUrl: string | null;
    icon: 'image' | 'file-text';
  } | null>(null);
  protected readonly bankFileError = signal<string | null>(null);
  protected readonly pdfPreviewUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.bankFile()?.pdfUrl;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  protected readonly previewFull = signal(false);
  protected readonly bankFileUploading = signal(false);
  protected readonly bankFileProgress = signal(0);
  private readonly bankFileInput = viewChild<ElementRef<HTMLInputElement>>('bankFileInput');
  private readonly bankPreviewDialog = viewChild.required<UiDialog>('bankPreviewDialog');
  private bankUploadTimer?: ReturnType<typeof setInterval>;

  protected readonly useVendorName = signal(false);
  protected readonly hasSkb = signal(false);
  protected readonly taxFiles = signal<Record<TaxFileKind, UploadFile | null>>({
    ktp: null,
    sppkp: null,
    skb: null,
  });
  protected readonly taxUploading = signal<Record<TaxFileKind, boolean>>({
    ktp: false,
    sppkp: false,
    skb: false,
  });
  protected readonly taxProgress = signal<Record<TaxFileKind, number>>({
    ktp: 0,
    sppkp: 0,
    skb: 0,
  });
  protected readonly taxFileError = signal<Record<TaxFileKind, string | null>>({
    ktp: null,
    sppkp: null,
    skb: null,
  });
  protected readonly taxPreview = signal<UploadFile | null>(null);
  protected readonly taxPreviewFull = signal(false);
  protected readonly taxPdfPreviewUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.taxPreview()?.pdfUrl;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  protected readonly taxDocLabel = computed(() =>
    this.vendorType() === 'INDIVIDUAL' ? this.t().taxDocKtp : this.t().taxDocNpwp,
  );
  protected readonly taxNameLabel = computed(() =>
    this.vendorType() === 'INDIVIDUAL' ? this.t().taxNameKtp : this.t().taxNameNpwp,
  );
  protected readonly taxAddressLabel = computed(() =>
    this.vendorType() === 'INDIVIDUAL' ? this.t().taxAddressKtp : this.t().taxAddressNpwp,
  );
  protected readonly taxAttachLabel = computed(() =>
    this.vendorType() === 'INDIVIDUAL' ? this.t().taxAttachKtp : this.t().taxAttachNpwp,
  );
  protected readonly taxAddressPlaceholder = computed(() =>
    this.vendorType() === 'INDIVIDUAL' ? this.t().phAddressKtp : this.t().phAddressNpwp,
  );
  private readonly taxFileInput = viewChild<ElementRef<HTMLInputElement>>('taxFileInput');
  private readonly taxPreviewDialog = viewChild.required<UiDialog>('taxPreviewDialog');
  private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');
  private readonly confirmDialog = viewChild.required<UiDialog>('confirmDialog');
  protected readonly confirmKind = signal<'cancel' | 'type' | null>(null);
  protected readonly pendingEntityType = signal<EntityType | null>(null);
  protected readonly confirmTitle = computed(() =>
    this.confirmKind() === 'cancel' ? this.t().cancelConfirmTitle : this.t().typeConfirmTitle,
  );
  protected readonly confirmMessage = computed(() =>
    this.confirmKind() === 'cancel' ? this.t().cancelConfirmMessage : this.t().typeConfirmMessage,
  );
  protected readonly confirmLabel = computed(() =>
    this.confirmKind() === 'cancel' ? this.t().yesCancel : this.t().yesChange,
  );
  private activeTaxKind: TaxFileKind = 'ktp';
  private taxTimers: Partial<Record<TaxFileKind, ReturnType<typeof setInterval>>> = {};

  protected readonly vendorForm = this.formBuilder.nonNullable.group(
    {
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      category: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.maxLength(250)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      picName: ['', [Validators.required]],
      picEmail: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      bankName: ['', [Validators.required]],
      bankAccountName: ['', [Validators.required]],
      bankAccountNumber: ['', [Validators.required]],
      currency: ['', [Validators.required]],
      recipientType: ['', [Validators.required]],
      bankStatement: ['', [Validators.required]],
      taxId: ['', [Validators.required]],
      taxName: ['', [Validators.required]],
      taxAddress: ['', [Validators.required, Validators.maxLength(250)]],
      sppkp: [''],
      ktpAttachment: ['', [Validators.required]],
      sppkpAttachment: [''],
      skbAttachment: [''],
    },
    { validators: passwordsMatch },
  );

  protected readonly countryDialog = viewChild.required<UiDialog>('countryDialog');
  protected readonly countryQuery = signal('');
  protected readonly selectedCountry = signal<Country>(COUNTRIES[0]);
  protected readonly filteredCountries = computed(() => {
    const query = this.countryQuery().trim().toLowerCase();
    if (!query) {
      return COUNTRIES;
    }
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.nameEn.toLowerCase().includes(query) ||
        country.dial.includes(query) ||
        country.iso.includes(query),
    );
  });

  constructor() {
    this.vendorForm.controls.bankName.valueChanges.pipe(takeUntilDestroyed()).subscribe((id) => {
      this.selectedBank.set(BANKS.find((bank) => bank.id === id) ?? null);
    });

    this.vendorForm.controls.type.valueChanges.pipe(takeUntilDestroyed()).subscribe((type) => {
      this.vendorType.set(type);
      if (type) {
        this.vendorForm.controls.recipientType.setValue(type);
      }
    });

    this.vendorForm.controls.name.valueChanges.pipe(takeUntilDestroyed()).subscribe((name) => {
      if (this.useVendorName()) {
        this.vendorForm.controls.taxName.setValue(name);
      }
    });
  }

  protected openCancelConfirm(): void {
    this.confirmKind.set('cancel');
    this.confirmDialog().open();
  }

  protected requestEntityType(type: EntityType): void {
    if (type === this.entityType()) {
      return;
    }
    this.pendingEntityType.set(type);
    this.confirmKind.set('type');
    this.confirmDialog().open();
  }

  protected cancelConfirmation(): void {
    this.confirmDialog().close();
  }

  protected confirmAction(): void {
    const kind = this.confirmKind();
    this.confirmDialog().close();

    if (kind === 'cancel') {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (kind === 'type') {
      const next = this.pendingEntityType();
      if (next) {
        this.entityType.set(next);
        this.resetVendorData();
        this.applyGovernmentType();
        this.toast.info(this.t().dataResetTitle, this.t().dataResetMessage);
      }
    }
  }

  protected onConfirmClosed(): void {
    this.confirmKind.set(null);
    this.pendingEntityType.set(null);
    this.syncEntityRadios();
  }

  private syncEntityRadios(): void {
    document.querySelectorAll<HTMLInputElement>('input[name="entity-type"]').forEach((radio) => {
      radio.checked = radio.value === this.entityType();
    });
  }

  private applyGovernmentType(): void {
    const type = this.vendorForm.controls.type;
    if (this.entityType() === 'government') {
      type.setValue('GOVERNMENT', { emitEvent: false });
      type.disable({ emitEvent: false });
      this.vendorType.set('GOVERNMENT');
      this.vendorForm.controls.recipientType.setValue('GOVERNMENT');
    } else {
      type.enable({ emitEvent: false });
      type.reset('', { emitEvent: false });
      this.vendorType.set('');
      this.vendorForm.controls.recipientType.reset('');
    }
  }

  private resetVendorData(): void {
    this.vendorForm.reset();
    this.useVendorName.set(false);
    this.hasSkb.set(false);
    this.removeBankFile();
    this.removeTaxFile('ktp');
    this.removeTaxFile('sppkp');
    this.removeTaxFile('skb');
    this.selectedBank.set(null);
    this.selectedCountry.set(COUNTRIES[0]);
    this.bankResults.set([]);
    this.bankQuery.set('');
    this.bankFileError.set(null);
    this.patchTaxError('ktp', null);
    this.patchTaxError('sppkp', null);
    this.patchTaxError('skb', null);
  }

  protected toggleUseVendorName(checked: boolean): void {
    this.useVendorName.set(checked);
    const control = this.vendorForm.controls.taxName;
    if (checked) {
      control.setValue(this.vendorForm.controls.name.value);
      control.disable({ emitEvent: false });
    } else {
      control.enable({ emitEvent: false });
    }
  }

  protected toggleSkb(checked: boolean): void {
    this.hasSkb.set(checked);
    const control = this.vendorForm.controls.skbAttachment;
    if (checked) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      this.removeTaxFile('skb');
    }
    control.updateValueAndValidity();
  }

  protected pickTaxFile(kind: TaxFileKind): void {
    this.activeTaxKind = kind;
    this.taxFileInput()?.nativeElement.click();
  }

  protected onTaxFileSelected(event: Event): void {
    const kind = this.activeTaxKind;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.patchTaxError(kind, null);
    const previous = this.taxFiles()[kind];
    if (previous?.pdfUrl) {
      URL.revokeObjectURL(previous.pdfUrl);
    }

    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.patchTaxError(kind, this.t().errFileType);
      this.removeTaxFile(kind);
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.patchTaxError(kind, this.t().errFileSize);
      this.removeTaxFile(kind);
      input.value = '';
      return;
    }

    const meta = `${this.fileExtension(file.name).toUpperCase()} · ${this.formatFileSize(file.size)}`;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.patchTaxFile(kind, {
          name: file.name,
          meta,
          image: String(reader.result),
          pdfUrl: null,
          icon: 'image',
        });
        this.simulateTaxUpload(kind);
      };
      reader.readAsDataURL(file);
    } else {
      this.patchTaxFile(kind, {
        name: file.name,
        meta,
        image: null,
        pdfUrl: URL.createObjectURL(file),
        icon: 'file-text',
      });
      this.simulateTaxUpload(kind);
    }

    const control = this.taxAttachmentControl(kind);
    control.setValue(file.name);
    control.markAsTouched();
    input.value = '';
  }

  protected removeTaxFile(kind: TaxFileKind): void {
    const previous = this.taxFiles()[kind];
    if (previous?.pdfUrl) {
      URL.revokeObjectURL(previous.pdfUrl);
    }
    clearInterval(this.taxTimers[kind]);
    this.patchTaxFile(kind, null);
    this.patchTaxUploading(kind, false);
    this.patchTaxProgress(kind, 0);
    this.taxAttachmentControl(kind).reset('');
  }

  protected openTaxPreview(kind: TaxFileKind): void {
    const file = this.taxFiles()[kind];
    if (file) {
      this.taxPreview.set(file);
      this.taxPreviewDialog().open();
    }
  }

  private simulateTaxUpload(kind: TaxFileKind): void {
    clearInterval(this.taxTimers[kind]);
    this.patchTaxUploading(kind, true);
    this.patchTaxProgress(kind, 0);
    this.taxTimers[kind] = setInterval(() => {
      const next = Math.min(100, this.taxProgress()[kind] + 20);
      this.patchTaxProgress(kind, next);
      if (next >= 100) {
        clearInterval(this.taxTimers[kind]);
        this.patchTaxUploading(kind, false);
      }
    }, 180);
  }

  private patchTaxFile(kind: TaxFileKind, file: UploadFile | null): void {
    this.taxFiles.update((state) => ({ ...state, [kind]: file }));
  }

  private patchTaxUploading(kind: TaxFileKind, value: boolean): void {
    this.taxUploading.update((state) => ({ ...state, [kind]: value }));
  }

  private patchTaxProgress(kind: TaxFileKind, value: number): void {
    this.taxProgress.update((state) => ({ ...state, [kind]: value }));
  }

  private patchTaxError(kind: TaxFileKind, value: string | null): void {
    this.taxFileError.update((state) => ({ ...state, [kind]: value }));
  }

  private taxAttachmentControl(kind: TaxFileKind) {
    if (kind === 'ktp') {
      return this.vendorForm.controls.ktpAttachment;
    }
    if (kind === 'sppkp') {
      return this.vendorForm.controls.sppkpAttachment;
    }
    return this.vendorForm.controls.skbAttachment;
  }

  protected setLang(language: Language): void {
    this.lang.set(language);
  }

  protected cancel(): void {
    this.router.navigate(['/auth/login']);
  }

  protected next(): void {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      this.scrollToFirstInvalid();
      return;
    }
    this.toast.success(this.t().profileSavedTitle, this.t().profileSavedMessage);
  }

  private scrollToFirstInvalid(): void {
    const order: Array<[string, string]> = [
      ['name', 'v-name'],
      ['type', 'v-type'],
      ['category', 'v-category'],
      ['address', 'v-address'],
      ['email', 'v-email'],
      ['password', 'v-password'],
      ['confirmPassword', 'v-confirm'],
      ['picName', 'v-pic-name'],
      ['picEmail', 'v-pic-email'],
      ['phone', 'v-phone'],
      ['bankName', 'b-bank'],
      ['bankAccountName', 'b-account-name'],
      ['bankAccountNumber', 'b-account-number'],
      ['currency', 'b-currency'],
      ['recipientType', 'b-recipient'],
      ['bankStatement', 'b-file-section'],
      ['taxId', 't-tax-id'],
      ['taxName', 't-tax-name'],
      ['taxAddress', 't-tax-address'],
      ['ktpAttachment', 't-ktp-section'],
      ['skbAttachment', 't-skb-section'],
    ];

    const first = order.find(([control]) => this.vendorForm.get(control)?.invalid);
    if (!first) {
      return;
    }

    const element = document.getElementById(first[1]);
    if (!element) {
      return;
    }

    const container = this.scrollContainer()?.nativeElement;
    if (container) {
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const target =
        container.scrollTop +
        (elementRect.top - containerRect.top) -
        (container.clientHeight - elementRect.height) / 2;
      container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    }

    const focusable = element.matches('input, select, textarea, button')
      ? element
      : element.querySelector<HTMLElement>('input, select, textarea, button');
    if (focusable) {
      setTimeout(() => focusable.focus({ preventScroll: true }), 320);
    }
  }

  protected fieldInvalid(name: string): boolean {
    const control = this.vendorForm.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected passwordMismatch(): boolean {
    const confirmation = this.vendorForm.controls.confirmPassword;
    return (
      this.vendorForm.hasError('passwordMismatch') && (confirmation.touched || confirmation.dirty)
    );
  }

  protected openCountry(): void {
    this.countryQuery.set('');
    this.countryDialog().open();
  }

  protected chooseCountry(country: Country): void {
    this.selectedCountry.set(country);
    this.countryDialog().close();
  }

  protected searchBanks(term: string): void {
    clearTimeout(this.bankSearchTimer);
    const query = term.trim().toLowerCase();
    this.bankQuery.set(query);

    if (!query) {
      this.bankLoading.set(false);
      this.bankResults.set([]);
      return;
    }

    this.bankLoading.set(true);
    this.bankSearchTimer = setTimeout(() => {
      const matches = BANKS.filter(
        (bank) =>
          bank.name.toLowerCase().includes(query) ||
          bank.country.toLowerCase().includes(query) ||
          bank.branch.toLowerCase().includes(query),
      ).map((bank) => ({
        value: bank.id,
        label: bank.name,
        description: `${bank.country} · ${bank.branch}`,
      }));
      this.bankResults.set(matches);
      this.bankLoading.set(false);
    }, 300);
  }

  protected onBankFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.bankFileError.set(null);

    const previous = this.bankFile();
    if (previous?.pdfUrl) {
      URL.revokeObjectURL(previous.pdfUrl);
    }

    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.bankFileError.set(this.t().errFileType);
      this.clearBankFile();
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.bankFileError.set(this.t().errFileSize);
      this.clearBankFile();
      input.value = '';
      return;
    }

    const meta = `${this.fileExtension(file.name).toUpperCase()} · ${this.formatFileSize(file.size)}`;
    const isImage = file.type.startsWith('image/');

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        this.bankFile.set({
          name: file.name,
          meta,
          image: String(reader.result),
          pdfUrl: null,
          icon: 'image',
        });
        this.simulateUpload();
      };
      reader.readAsDataURL(file);
    } else {
      this.bankFile.set({
        name: file.name,
        meta,
        image: null,
        pdfUrl: URL.createObjectURL(file),
        icon: 'file-text',
      });
      this.simulateUpload();
    }

    this.vendorForm.controls.bankStatement.setValue(file.name);
    this.vendorForm.controls.bankStatement.markAsTouched();
  }

  protected removeBankFile(): void {
    this.clearBankFile();
    this.bankFileError.set(null);
    const input = this.bankFileInput()?.nativeElement;
    if (input) {
      input.value = '';
    }
  }

  protected openBankFilePicker(): void {
    this.bankFileInput()?.nativeElement.click();
  }

  private clearBankFile(): void {
    const previous = this.bankFile();
    if (previous?.pdfUrl) {
      URL.revokeObjectURL(previous.pdfUrl);
    }
    clearInterval(this.bankUploadTimer);
    this.bankFileUploading.set(false);
    this.bankFileProgress.set(0);
    this.bankFile.set(null);
    this.vendorForm.controls.bankStatement.reset('');
  }

  private simulateUpload(): void {
    clearInterval(this.bankUploadTimer);
    this.bankFileUploading.set(true);
    this.bankFileProgress.set(0);
    this.bankUploadTimer = setInterval(() => {
      const next = Math.min(100, this.bankFileProgress() + 20);
      this.bankFileProgress.set(next);
      if (next >= 100) {
        clearInterval(this.bankUploadTimer);
        this.bankFileUploading.set(false);
      }
    }, 180);
  }

  protected openBankPreview(): void {
    if (this.bankFile()) {
      this.bankPreviewDialog().open();
    }
  }

  private fileExtension(name: string): string {
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'file';
  }

  private formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  protected countryName(country: Country): string {
    return this.lang() === 'id' ? country.name : country.nameEn;
  }
}
