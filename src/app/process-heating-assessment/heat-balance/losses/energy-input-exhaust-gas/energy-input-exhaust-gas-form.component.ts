import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { generateFormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { EnergyInputExhaustGasForm } from './energy-input-exhaust-gas-form.service';
import { EnergyInputExhaustGasItem } from './energy-input-exhaust-gas.service';

@Component({
  selector: 'app-energy-input-exhaust-gas-form',
  standalone: false,
  templateUrl: './energy-input-exhaust-gas-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnergyInputExhaustGasFormComponent {
  readonly item = input.required<EnergyInputExhaustGasItem>();
  readonly settings = input.required<Settings>();

  readonly form = computed(() => this.item().form as EnergyInputExhaustGasForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));
}
