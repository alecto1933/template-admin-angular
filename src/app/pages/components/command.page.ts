import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { CommandItem, UiCommand } from '../../shared/ui/command/command';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

const COMMANDS: CommandItem[] = [
  {
    id: 'dashboard',
    label: 'Buka dashboard',
    group: 'Navigasi',
    icon: 'layout-dashboard',
    shortcut: 'G D',
    keywords: 'home ringkasan',
  },
  {
    id: 'orders',
    label: 'Lihat pesanan',
    group: 'Navigasi',
    icon: 'shopping-cart',
    shortcut: 'G O',
    keywords: 'transaksi order',
  },
  {
    id: 'customers',
    label: 'Daftar pelanggan',
    group: 'Navigasi',
    icon: 'users',
    keywords: 'customer user',
  },
  {
    id: 'settings',
    label: 'Buka pengaturan',
    group: 'Navigasi',
    icon: 'settings',
    shortcut: 'G S',
  },
  {
    id: 'new-order',
    label: 'Buat pesanan baru',
    group: 'Aksi',
    icon: 'plus',
    shortcut: 'N',
  },
  {
    id: 'export',
    label: 'Ekspor laporan',
    group: 'Aksi',
    icon: 'download',
    shortcut: 'E',
  },
  {
    id: 'invite',
    label: 'Undang anggota tim',
    group: 'Aksi',
    icon: 'user-plus',
  },
  {
    id: 'billing',
    label: 'Kelola tagihan',
    group: 'Akun',
    icon: 'credit-card',
  },
  {
    id: 'security',
    label: 'Keamanan akun',
    group: 'Akun',
    icon: 'shield-check',
  },
  {
    id: 'logout',
    label: 'Keluar dari akun',
    group: 'Akun',
    icon: 'log-out',
  },
];

@Component({
  selector: 'app-command',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiCommand],
  templateUrl: './command.page.html',
})
export class CommandPage {
  private readonly toast = inject(ToastService);

  protected readonly commands = COMMANDS;
  protected readonly navigation = COMMANDS.filter((command) => command.group === 'Navigasi');
  protected readonly shortcuts = COMMANDS.filter((command) => !!command.shortcut);
  protected readonly many = Array.from({ length: 3 }, (_, loop) =>
    COMMANDS.map((command) => ({
      ...command,
      id: `${command.id}-${loop}`,
      group: `Grup ${loop + 1}`,
    })),
  ).flat();

  protected run(command: CommandItem): void {
    this.toast.success(command.label, 'Perintah dijalankan (demo).');
  }
}
