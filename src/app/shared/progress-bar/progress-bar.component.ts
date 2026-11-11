import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** `active` while work runs, `complete` when it finished, `error` when it stopped on a failure. */
export type ProgressBarStatus = 'active' | 'complete' | 'error';

/**
 * Striped progress bar in the style of the app update download bar.
 * Shows the rounded percent inside the bar unless a label is given.
 */
@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent {
  /** Progress from 0 to 100; values outside that range are clamped. */
  percent = input<number>(0);
  /** Text shown inside the bar in place of the percent. */
  label = input<string>();
  status = input<ProgressBarStatus>('active');

  clampedPercent = computed<number>(() => Math.min(100, Math.max(0, this.percent() ?? 0)));
  barText = computed<string>(() => this.label() ?? `${Math.round(this.clampedPercent())}%`);
}
