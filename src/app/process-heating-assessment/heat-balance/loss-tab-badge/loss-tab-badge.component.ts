import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Loss tab status badge: the entry count, green while valid and red while invalid. */
@Component({
  selector: 'app-loss-tab-badge',
  standalone: false,
  templateUrl: './loss-tab-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LossTabBadgeComponent {
  /** Entries the tab holds; undefined for a step that doesn't hold entries */
  readonly count = input<number | undefined>();
  readonly invalid = input(false);
}
