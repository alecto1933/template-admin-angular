import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UiBadge } from '@/shared/ui/badge/badge';
import { UiIcon } from '@/shared/ui/icon/icon';
import { environment } from '@env/environment';
import { TranslationService } from '@/core/i18n/translation.service';
import { ACTIVITIES, ANNOUNCEMENTS, HOME_TEXTS } from '@/core/i18n/home.texts';
import { ToastService } from '@/shared/ui/toast/toast.service';
import { RollingTitle } from '@/pages/home/rolling-title';

interface QuickAccessItem {
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiBadge, UiIcon, RollingTitle],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  protected readonly lang = this.i18n.lang;
  protected readonly t = computed(() => HOME_TEXTS[this.lang()]);
  protected readonly activities = computed(() => ACTIVITIES[this.lang()]);
  protected readonly announcements = computed(() => ANNOUNCEMENTS[this.lang()]);
  protected readonly supportMailto = `mailto:${environment.supportEmail}`;

  protected readonly quickAccess = computed<QuickAccessItem[]>(() => {
    const t = this.t();
    return [
      {
        title: t.qaVendorTitle,
        description: t.qaVendorDesc,
        image: 'images/apps/vendor-profile.webp',
      },
      {
        title: t.qaOrderTitle,
        description: t.qaOrderDesc,
        image: 'images/apps/purchase-order.webp',
      },
      { title: t.qaBillionTitle, description: t.qaBillionDesc, image: 'images/apps/billing.webp' },
      {
        title: t.qaBiddingTitle,
        description: t.qaBiddingDesc,
        image: 'images/apps/bidding-auction.webp',
      },
      {
        title: t.qaCapaTitle,
        description: t.qaCapaDesc,
        image: 'images/apps/capa-tracker.webp',
      },
    ];
  });

  protected scrollToQuickAccess(): void {
    document.getElementById('quick-access')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected openQuickAccess(item: QuickAccessItem): void {
    this.toast.info(this.t().comingSoonTitle, `${item.title} — ${this.t().comingSoonMessage}`);
  }
}
