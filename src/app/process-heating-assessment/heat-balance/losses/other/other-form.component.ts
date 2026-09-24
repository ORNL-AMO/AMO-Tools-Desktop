import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { generateFormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { OtherForm } from './other-form.service';
import { OtherItem } from './other.service';

@Component({
  selector: 'app-other-form',
  standalone: false,
  templateUrl: './other-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtherFormComponent {
  readonly item = input.required<OtherItem>();
  readonly settings = input.required<Settings>();

  readonly form = computed(() => this.item().form as OtherForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }
}
