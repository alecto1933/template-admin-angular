import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiInputOtp } from '../../shared/ui/input-otp/input-otp';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-input-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, UiPageHeader, UiButton, UiIcon, UiInputOtp],
  templateUrl: './input-otp.page.html',
})
export class InputOtpPage {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly numeric = signal('');
  protected readonly alphanumeric = signal('');
  protected readonly fourDigits = signal('');
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  protected submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.toast.success('Kode terverifikasi', this.form.controls.code.value);
  }
}
