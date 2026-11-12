import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';

type PageItem = number | 'ellipsis';

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon],
  templateUrl: './pagination.page.html',
})
export class PaginationPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly totalItems = 96;
  protected readonly pageSize = signal(10);
  protected readonly page = signal(1);
  protected readonly iconPage = signal(2);
  protected readonly queryPage = signal(1);
  protected readonly advancedQueryPage = signal(1);
  protected readonly min = Math.min;

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems / this.pageSize())),
  );

  protected readonly pages = computed(() => this.buildPages(this.page(), this.totalPages()));

  protected readonly queryPages = computed(() =>
    this.buildPages(this.queryPage(), this.totalPages()),
  );

  protected readonly advancedQueryPages = computed(() =>
    this.buildPages(this.advancedQueryPage(), this.totalPages()),
  );

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const page = Number(params.get('page') ?? '1');
      const halaman = Number(params.get('halaman') ?? '1');
      this.queryPage.set(this.clamp(page, this.totalPages()));
      this.advancedQueryPage.set(this.clamp(halaman, this.totalPages()));
    });
  }

  protected go(page: number): void {
    this.page.set(this.clamp(page, this.totalPages()));
  }

  protected goIcon(page: number): void {
    this.iconPage.set(this.clamp(page, this.totalPages()));
  }

  protected goQuery(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.clamp(page, this.totalPages()) },
      queryParamsHandling: 'merge',
    });
  }

  protected goAdvancedQuery(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { halaman: this.clamp(page, this.totalPages()) },
      queryParamsHandling: 'merge',
    });
  }

  protected onPageSizeChange(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(1);
  }

  protected clamp(page: number, total: number): number {
    return Math.min(Math.max(1, Number.isFinite(page) ? page : 1), total);
  }

  private buildPages(current: number, total: number): PageItem[] {
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const wanted = new Set([1, total, current, current - 1, current + 1]);
    const numbers = [...wanted].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

    const items: PageItem[] = [];
    numbers.forEach((page, index) => {
      if (index > 0 && page - numbers[index - 1] > 1) {
        items.push('ellipsis');
      }
      items.push(page);
    });

    return items;
  }
}
