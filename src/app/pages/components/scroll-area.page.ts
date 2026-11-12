import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-scroll-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon],
  templateUrl: './scroll-area.page.html',
})
export class ScrollAreaPage {
  protected readonly items = Array.from({ length: 8 }, (_, index) => ({
    title: `Kartu ${index + 1}`,
    text: 'Geser horizontal untuk melihat kartu berikutnya.',
  }));
}
