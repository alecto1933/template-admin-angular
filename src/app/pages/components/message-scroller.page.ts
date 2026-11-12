import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';

interface ChatMessage {
  id: number;
  author: string;
  initials: string;
  mine: boolean;
  text: string;
  time: string;
}

const PRODUCT_THREAD: ChatMessage[] = [
  {
    id: 1,
    author: 'Dewi Lestari',
    initials: 'DL',
    mine: false,
    text: 'Selamat pagi! Siap untuk rilis hari ini?',
    time: '08:12',
  },
  {
    id: 2,
    author: 'Raka Pratama',
    initials: 'RP',
    mine: true,
    text: 'Siap. Semua test sudah hijau.',
    time: '08:14',
  },
  {
    id: 3,
    author: 'Bagas Saputra',
    initials: 'BS',
    mine: false,
    text: 'Aku sedang cek performa halaman pesanan dulu.',
    time: '08:16',
  },
  {
    id: 4,
    author: 'Bagas Saputra',
    initials: 'BS',
    mine: false,
    text: 'LCP turun dari 2,8s ke 1,9s setelah optimasi gambar.',
    time: '08:18',
  },
  {
    id: 5,
    author: 'Raka Pratama',
    initials: 'RP',
    mine: true,
    text: 'Mantap. Berarti bisa lanjut deploy sore ini.',
    time: '08:20',
  },
  {
    id: 6,
    author: 'Dewi Lestari',
    initials: 'DL',
    mine: false,
    text: 'Aku siapkan catatan rilis dan pengumuman ke tim.',
    time: '08:24',
  },
];

const SUPPORT_THREAD: ChatMessage[] = [
  {
    id: 11,
    author: 'Siti Nurhaliza',
    initials: 'SN',
    mine: false,
    text: 'Ada pelanggan yang bertanya soal pengembalian dana.',
    time: '09:02',
  },
  {
    id: 12,
    author: 'Raka Pratama',
    initials: 'RP',
    mine: true,
    text: 'Sudah dicek? Status pesanannya apa?',
    time: '09:04',
  },
  {
    id: 13,
    author: 'Siti Nurhaliza',
    initials: 'SN',
    mine: false,
    text: 'INV-2046, sudah dikembalikan tapi dana belum masuk.',
    time: '09:05',
  },
  {
    id: 14,
    author: 'Raka Pratama',
    initials: 'RP',
    mine: true,
    text: 'Aku eskalasi ke tim pembayaran sekarang.',
    time: '09:06',
  },
];

@Component({
  selector: 'app-message-scroller',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon],
  templateUrl: './message-scroller.page.html',
})
export class MessageScrollerPage {
  protected readonly thread = signal('Tim Produk');
  protected readonly messages = signal<ChatMessage[]>([...PRODUCT_THREAD]);
  protected readonly atBottom = signal(true);
  protected readonly follow = signal(true);
  protected readonly newCount = signal(0);
  protected readonly scrollTop = signal(0);
  protected readonly lastAdded = signal<number | null>(null);

  private nextId = 100;
  private readonly scroller = viewChild.required<ElementRef<HTMLDivElement>>('scroller');

  constructor() {
    afterNextRender(() => this.scrollToBottom());
  }

  protected onScroll(): void {
    const el = this.scroller().nativeElement;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    this.scrollTop.set(Math.round(el.scrollTop));
    this.atBottom.set(distance < 32);
    if (this.atBottom()) {
      this.newCount.set(0);
    }
  }

  protected scrollToBottom(smooth = true): void {
    const el = this.scroller().nativeElement;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    this.newCount.set(0);
  }

  protected addMessage(): void {
    const id = this.nextId++;
    this.messages.update((messages) => [
      ...messages,
      {
        id,
        author: 'Anda',
        initials: 'AN',
        mine: true,
        text: `Pesan baru #${id}. Klik untuk melihat animasi masuk.`,
        time: 'Sekarang',
      },
    ]);
    this.lastAdded.set(id);

    if (this.follow()) {
      setTimeout(() => this.scrollToBottom(), 40);
    } else {
      this.newCount.update((count) => count + 1);
    }
  }

  protected loadEarlier(): void {
    const el = this.scroller().nativeElement;
    const before = el.scrollHeight;
    const earlier: ChatMessage[] = Array.from({ length: 5 }, (_, index) => ({
      id: this.nextId++,
      author: index % 2 === 0 ? 'Dewi Lestari' : 'Bagas Saputra',
      initials: index % 2 === 0 ? 'DL' : 'BS',
      mine: false,
      text: `Pesan sebelumnya ${index + 1} — riwayat percakapan.`,
      time: 'Kemarin',
    }));

    this.messages.update((messages) => [...earlier, ...messages]);
    setTimeout(() => {
      el.scrollTop += el.scrollHeight - before;
    });
  }

  protected jumpToFirst(): void {
    const first = this.messages()[0];
    document
      .getElementById(`message-${first.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  protected switchThread(name: string): void {
    this.thread.set(name);
    this.messages.set(name === 'Tim Produk' ? [...PRODUCT_THREAD] : [...SUPPORT_THREAD]);
    this.nextId = 100;
    setTimeout(() => this.scrollToBottom(false));
  }

  protected toggleFollow(): void {
    this.follow.update((follow) => !follow);
    if (this.follow()) {
      this.scrollToBottom();
    }
  }
}
