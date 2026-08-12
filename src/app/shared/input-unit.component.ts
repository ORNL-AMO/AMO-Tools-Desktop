import { Component, Input } from '@angular/core';
import { Settings } from './models/settings';

/**
 *   - imperialUnit: string  - The unit label for imperial system.
 *   - metricUnit: string - The unit label for metric system.
 *   - defaultUnit: string - overrides imperial/metric unit selection. Use in case of settings.SomeKindofunit or known unit
 */
@Component({
  selector: 'app-input-unit',
  template: `<span [innerHTML]="unit"></span>`,
  standalone: true,
  host: {
    'class': 'input-group-addon units',
  },
})
export class InputUnitComponent {
  @Input() settings: Settings;
  @Input() imperialUnit: string;
  @Input() metricUnit: string;
  @Input() defaultUnit: string;

  get unit(): string {
    if (this.defaultUnit) {
      return this.defaultUnit;
    }
    return this.settings?.unitsOfMeasure === 'Imperial' ? this.imperialUnit : this.metricUnit;
  }
}
