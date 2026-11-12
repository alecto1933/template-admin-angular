import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiTab, UiTabs } from '../../shared/ui/tabs/tabs';

@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiTabs, UiTab],
  templateUrl: './tabs.page.html',
})
export class TabsPage {
  protected readonly vertical = signal('overview');
  protected readonly line = signal('overview');
  protected readonly iconsOnly = signal('grid');
  protected readonly headerTab = signal('overview');
  protected readonly tabPage = signal(0);
  protected readonly lazyCount = signal(0);

  protected readonly longTabs = [
    'Overview',
    'Aktivitas',
    'Anggota',
    'Keamanan',
    'Tagihan',
    'Integrasi',
    'Log',
    'Ekspor',
  ];

  protected readonly visibleTabs = signal(this.longTabs.slice(0, 4));

  protected nextTabPage(): void {
    const next = (this.tabPage() + 1) % 2;
    this.tabPage.set(next);
    this.visibleTabs.set(this.longTabs.slice(next * 4, next * 4 + 4));
  }

  protected previousTabPage(): void {
    this.nextTabPage();
  }
}
