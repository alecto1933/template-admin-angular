import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiDialog } from '../../shared/ui/dialog/dialog';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiProgress } from '../../shared/ui/progress/progress';

const STORAGE_KEY = 'alecto-questionnaire';

@Component({
  selector: 'app-questionnaire',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiProgress, UiDialog],
  templateUrl: './questionnaire.page.html',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class QuestionnairePage {
  protected readonly steps = ['Tujuan', 'Kebutuhan', 'Tim'];
  protected readonly step = signal(0);
  protected readonly goals = signal<string[]>(['team']);
  protected readonly need = signal('');
  protected readonly teamSize = signal('');
  protected readonly error = signal('');
  protected readonly completed = signal(false);
  protected readonly savedAt = signal<string | null>(null);
  protected readonly dialogChoice = signal('');

  protected readonly hasTeamGoal = computed(() => this.goals().includes('team'));
  protected readonly progress = computed(() =>
    this.completed() ? 100 : Math.round(((this.step() + 1) / 3) * 100),
  );

  protected toggleGoal(goal: string): void {
    const current = this.goals();
    this.goals.set(
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
    );
    this.error.set('');
  }

  protected next(): void {
    const step = this.step();

    if (step === 0 && this.goals().length === 0) {
      this.error.set('Pilih minimal satu tujuan.');
      return;
    }

    if (step === 1 && this.hasTeamGoal() && !this.teamSize()) {
      this.error.set('Pilih ukuran tim terlebih dahulu.');
      return;
    }

    this.error.set('');
    this.save();

    if (step < 2) {
      this.step.set(step + 1);
      return;
    }

    this.completed.set(true);
  }

  protected skip(): void {
    this.error.set('');
    if (this.step() < 2) {
      this.step.set(this.step() + 1);
    } else {
      this.completed.set(true);
    }
  }

  protected back(): void {
    this.error.set('');
    this.step.update((step) => Math.max(0, step - 1));
  }

  protected goToStep(step: number): void {
    this.completed.set(false);
    this.step.set(step);
    this.error.set('');
  }

  protected save(): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          step: this.step(),
          goals: this.goals(),
          need: this.need(),
          teamSize: this.teamSize(),
        }),
      );
      this.savedAt.set(new Date().toLocaleTimeString('id-ID'));
    } catch {
      // Storage may be unavailable.
    }
  }

  protected loadSaved(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }
      const value = JSON.parse(stored) as {
        step: number;
        goals: string[];
        need: string;
        teamSize: string;
      };
      this.step.set(value.step ?? 0);
      this.goals.set(value.goals ?? []);
      this.need.set(value.need ?? '');
      this.teamSize.set(value.teamSize ?? '');
      this.completed.set(false);
      this.error.set('');
    } catch {
      // Ignore malformed storage.
    }
  }

  protected reset(): void {
    this.step.set(0);
    this.goals.set([]);
    this.need.set('');
    this.teamSize.set('');
    this.error.set('');
    this.completed.set(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!event.altKey) {
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.back();
    }
  }
}
