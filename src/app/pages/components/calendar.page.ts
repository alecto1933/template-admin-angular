import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../../core/format';
import { UiButton } from '../../shared/ui/button/button';
import { UiCalendar } from '../../shared/ui/calendar/calendar';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, UiPageHeader, UiButton, UiIcon, UiCalendar],
  templateUrl: './calendar.page.html',
})
export class CalendarPage {
  protected readonly multipleValue = signal<Date[]>([]);
  protected readonly rangeValue = signal<Date[]>([]);
  protected readonly singleValue = signal<Date[]>([]);

  protected readonly rangeLabel = computed(() => {
    const dates = this.rangeValue();
    if (dates.length === 2) {
      return `${formatDate(dates[0])} – ${formatDate(dates[1])}`;
    }
    return dates.length === 1
      ? `${formatDate(dates[0])} – pilih tanggal akhir`
      : 'Belum ada rentang dipilih';
  });
}
