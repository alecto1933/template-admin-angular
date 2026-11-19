import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiButton } from '../../shared/ui/button/button';
import { UiDialog } from '../../shared/ui/dialog/dialog';
import { UiIcon } from '../../shared/ui/icon/icon';
import { SelectOption, UiSelect } from '../../shared/ui/select/select';

export interface BankRequest {
  id: string;
  name: string;
  countryIso: string;
  region: string;
  address: string;
  branch: string;
  city: string;
  swiftCode: string;
}

export interface BankRequestTexts {
  titleCreate: string;
  titleEdit: string;
  warningTitle: string;
  warning: string;
  fieldName: string;
  fieldCountry: string;
  fieldRegion: string;
  fieldAddress: string;
  fieldBranch: string;
  fieldCity: string;
  fieldSwift: string;
  swiftHint: string;
  errRequired: string;
  errSwift: string;
  save: string;
  cancel: string;
}

type BankRequestField =
  'name' | 'countryIso' | 'region' | 'address' | 'branch' | 'city' | 'swiftCode';

const SWIFT_PATTERN = /^([A-Z0-9]{8}|[A-Z0-9]{11})$/i;

/**
 * Modal form used to request a bank that is not registered yet.
 *
 * <app-bank-request-dialog
 *   [texts]="texts()"
 *   [countryOptions]="countryOptions()"
 *   (saved)="onBankRequestSaved($event)"
 * />
 *
 * Open it from a template reference: dialog.open() or dialog.open(existingRequest).
 */
@Component({
  selector: 'app-bank-request-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UiButton, UiDialog, UiIcon, UiSelect],
  template: `
    <ui-dialog #dialog [title]="title()" panelClass="max-w-lg">
      <form [formGroup]="form" class="space-y-4" (submit)="$event.preventDefault()">
        <div uiAlert data-variant="warning" role="status">
          <ui-icon name="triangle-alert" class="mt-0.5 size-4 shrink-0" />
          <div class="min-w-0">
            <p class="font-semibold">{{ texts().warningTitle }}</p>
            <p class="mt-0.5 leading-relaxed whitespace-pre-line">{{ texts().warning }}</p>
          </div>
        </div>

        <div class="space-y-1.5">
          <label uiLabel for="br-name">
            {{ texts().fieldName }}
            <span class="text-destructive">*</span>
          </label>
          <input
            uiInput
            id="br-name"
            type="text"
            formControlName="name"
            [attr.aria-invalid]="invalid('name') ? 'true' : null"
          />
          @if (invalid('name')) {
            <p class="ui-error">
              <ui-icon name="circle-help" class="size-3" />
              {{ errorFor('name') }}
            </p>
          }
        </div>

        <div class="space-y-1.5">
          <label uiLabel for="br-country">
            {{ texts().fieldCountry }}
            <span class="text-destructive">*</span>
          </label>
          <ui-select
            inputId="br-country"
            formControlName="countryIso"
            [options]="countryOptions()"
            [invalid]="invalid('countryIso')"
            leadingIcon="globe"
          />
          @if (invalid('countryIso')) {
            <p class="ui-error">
              <ui-icon name="circle-help" class="size-3" />
              {{ errorFor('countryIso') }}
            </p>
          }
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label uiLabel for="br-region">
              {{ texts().fieldRegion }}
              <span class="text-destructive">*</span>
            </label>
            <input
              uiInput
              id="br-region"
              type="text"
              formControlName="region"
              [attr.aria-invalid]="invalid('region') ? 'true' : null"
            />
            @if (invalid('region')) {
              <p class="ui-error">
                <ui-icon name="circle-help" class="size-3" />
                {{ errorFor('region') }}
              </p>
            }
          </div>

          <div class="space-y-1.5">
            <label uiLabel for="br-city">
              {{ texts().fieldCity }}
              <span class="text-destructive">*</span>
            </label>
            <input
              uiInput
              id="br-city"
              type="text"
              formControlName="city"
              [attr.aria-invalid]="invalid('city') ? 'true' : null"
            />
            @if (invalid('city')) {
              <p class="ui-error">
                <ui-icon name="circle-help" class="size-3" />
                {{ errorFor('city') }}
              </p>
            }
          </div>
        </div>

        <div class="space-y-1.5">
          <label uiLabel for="br-address">
            {{ texts().fieldAddress }}
            <span class="text-destructive">*</span>
          </label>
          <input
            uiInput
            id="br-address"
            type="text"
            formControlName="address"
            [attr.aria-invalid]="invalid('address') ? 'true' : null"
          />
          @if (invalid('address')) {
            <p class="ui-error">
              <ui-icon name="circle-help" class="size-3" />
              {{ errorFor('address') }}
            </p>
          }
        </div>

        <div class="space-y-1.5">
          <label uiLabel for="br-branch">
            {{ texts().fieldBranch }}
            <span class="text-destructive">*</span>
          </label>
          <input
            uiInput
            id="br-branch"
            type="text"
            formControlName="branch"
            [attr.aria-invalid]="invalid('branch') ? 'true' : null"
          />
          @if (invalid('branch')) {
            <p class="ui-error">
              <ui-icon name="circle-help" class="size-3" />
              {{ errorFor('branch') }}
            </p>
          }
        </div>

        <div class="space-y-1.5">
          <label uiLabel for="br-swift">
            {{ texts().fieldSwift }}
            <span class="text-destructive">*</span>
          </label>
          <input
            uiInput
            id="br-swift"
            type="text"
            formControlName="swiftCode"
            autocapitalize="characters"
            spellcheck="false"
            (input)="onSwiftInput($event)"
            [attr.aria-invalid]="invalid('swiftCode') ? 'true' : null"
          />
          <p class="ui-help text-[11px]">{{ texts().swiftHint }}</p>
          @if (invalid('swiftCode')) {
            <p class="ui-error">
              <ui-icon name="circle-help" class="size-3" />
              {{ errorFor('swiftCode') }}
            </p>
          }
        </div>
      </form>

      <div dialogFooter class="flex justify-end gap-2">
        <button uiButton variant="outline" type="button" (click)="close()">
          {{ texts().cancel }}
        </button>
        <button uiButton type="button" (click)="save()">{{ texts().save }}</button>
      </div>
    </ui-dialog>
  `,
})
export class BankRequestDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialog = viewChild.required(UiDialog);

  readonly texts = input.required<BankRequestTexts>();
  readonly countryOptions = input<SelectOption[]>([]);
  readonly saved = output<BankRequest>();

  protected readonly editingId = signal<string | null>(null);
  protected readonly title = computed(() =>
    this.editingId() ? this.texts().titleEdit : this.texts().titleCreate,
  );

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    countryIso: ['', [Validators.required]],
    region: ['', [Validators.required]],
    address: ['', [Validators.required]],
    branch: ['', [Validators.required]],
    city: ['', [Validators.required]],
    swiftCode: ['', [Validators.required, Validators.pattern(SWIFT_PATTERN)]],
  });

  open(initial: Partial<BankRequest> | null = null): void {
    this.editingId.set(initial?.id ?? null);
    this.form.reset({
      name: initial?.name ?? '',
      countryIso: initial?.countryIso ?? '',
      region: initial?.region ?? '',
      address: initial?.address ?? '',
      branch: initial?.branch ?? '',
      city: initial?.city ?? '',
      swiftCode: initial?.swiftCode ?? '',
    });
    this.dialog().open();
  }

  protected close(): void {
    this.dialog().close();
  }

  protected invalid(field: BankRequestField): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected errorFor(field: BankRequestField): string {
    return this.form.controls[field].hasError('pattern')
      ? this.texts().errSwift
      : this.texts().errRequired;
  }

  protected onSwiftInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    if (input.value !== upper) {
      input.value = upper;
    }
    this.form.controls.swiftCode.setValue(upper, { emitEvent: false });
  }

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.saved.emit({
      id: this.editingId() ?? `bank-request-${Date.now()}`,
      name: value.name.trim(),
      countryIso: value.countryIso,
      region: value.region.trim(),
      address: value.address.trim(),
      branch: value.branch.trim(),
      city: value.city.trim(),
      swiftCode: value.swiftCode.trim().toUpperCase(),
    });
    this.dialog().close();
  }
}
