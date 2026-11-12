import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, UiPageHeader, UiButton, UiIcon],
  templateUrl: './textarea.page.html',
})
export class TextareaPage {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly submitted = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.toast.success('Pesan terkirim', this.form.controls.message.value);
  }
}
