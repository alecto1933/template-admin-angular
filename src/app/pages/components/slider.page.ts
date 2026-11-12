import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiSlider } from '../../shared/ui/slider/slider';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, UiPageHeader, UiButton, UiIcon, UiSlider],
  templateUrl: './slider.page.html',
})
export class SliderPage {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly single = signal([40]);
  protected readonly range = signal([25, 75]);
  protected readonly vertical = signal([30]);
  protected readonly prevent = signal([20, 60]);
  protected readonly draggable = signal([20, 60]);
  protected readonly draggableOnly = signal([30, 70]);
  protected readonly ticks = signal([50]);
  protected readonly labeled = signal([40]);

  protected readonly form = this.fb.nonNullable.group({
    volume: [[45] as number[]],
    price: [[20, 80] as number[]],
  });

  protected submit(): void {
    const value = this.form.getRawValue();
    this.toast.success(
      'Slider disimpan',
      `Volume ${value.volume[0]}% · Harga ${value.price[0]}–${value.price[1]}`,
    );
  }
}
