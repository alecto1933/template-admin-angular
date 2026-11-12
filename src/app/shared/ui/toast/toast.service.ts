import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. Use 0 to keep the toast until dismissed. */
  duration?: number;
}

export interface Toast extends Required<Omit<ToastOptions, 'duration'>> {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  readonly toasts = signal<Toast[]>([]);
  readonly position = signal<ToastPosition>('bottom-right');

  setPosition(position: ToastPosition): void {
    this.position.set(position);
  }

  show(options: ToastOptions): number {
    const id = ++this.nextId;
    const toast: Toast = {
      id,
      title: options.title,
      description: options.description ?? '',
      variant: options.variant ?? 'info',
    };

    this.toasts.update((toasts) => [...toasts, toast]);

    const duration = options.duration ?? 4500;
    if (duration > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
    }

    return id;
  }

  success(title: string, description?: string): number {
    return this.show({ title, description, variant: 'success' });
  }

  error(title: string, description?: string): number {
    return this.show({ title, description, variant: 'error' });
  }

  info(title: string, description?: string): number {
    return this.show({ title, description, variant: 'info' });
  }

  warning(title: string, description?: string): number {
    return this.show({ title, description, variant: 'warning' });
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
