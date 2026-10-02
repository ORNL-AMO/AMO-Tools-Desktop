import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasForm, OXYGEN_CALCULATION_METHODS, OxygenCalculationMethod } from './flue-gas-form.service';

/** Operating-condition fields shared by the By Volume and By Mass flue gas forms. */
@Component({
  selector: 'app-flue-gas-conditions-fields',
  standalone: false,
  templateUrl: './flue-gas-conditions-fields.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlueGasConditionsFieldsComponent {
  readonly form = input.required<FlueGasForm>();
  readonly settings = input.required<Settings>();
  readonly instanceId = input.required<string>();

  readonly OxygenCalculationMethod = OxygenCalculationMethod;
  readonly calculationMethods = OXYGEN_CALCULATION_METHODS;

  /** Zeroes both O2 and excess air so only the newly selected method's input is entered. */
  changeOxygenCalculationMethod(): void {
    this.form().patchValue({ o2InFlueGas: 0, excessAirPercentage: 0 });
  }
}
