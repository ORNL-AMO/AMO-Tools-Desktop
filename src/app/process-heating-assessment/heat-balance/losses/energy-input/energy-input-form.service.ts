import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../../shared/models/settings';

export type EnergyInputForm = FormGroup<{
  naturalGasHeatInput: FormControl<number | null>;
  flowRateInput: FormControl<number | null>;
  coalCarbonInjection: FormControl<number | null>;
  coalHeatingValue: FormControl<number | null>;
  electrodeUse: FormControl<number | null>;
  electrodeHeatingValue: FormControl<number | null>;
  otherFuels: FormControl<number | null>;
  electricityInput: FormControl<number | null>;
}>;

const DEFAULT_COAL_HEATING_VALUE_BTU_LB = 12000;
const DEFAULT_ELECTRODE_HEATING_VALUE_BTU_LB = 14000;
// Typical higher heating value of pipeline natural gas, in Btu per standard cubic foot
const NATURAL_GAS_HEATING_VALUE_BTU_SCF = 1020;
// Btu per MMBtu
const BTU_PER_MMBTU = Math.pow(10, 6);

@Injectable()
export class EnergyInputFormService {
  private readonly fb = inject(FormBuilder);
  private readonly convertUnitsService = inject(ConvertUnitsService);

  getEnergyInputForm(loss: EnergyInputEAF = {}, settings?: Settings): EnergyInputForm {
    const nonNegative = [Validators.required, Validators.min(0)];
    return this.fb.group({
      naturalGasHeatInput: [loss.naturalGasHeatInput ?? null, nonNegative],
      flowRateInput: [loss.flowRateInput ?? null],
      coalCarbonInjection: [loss.coalCarbonInjection ?? null, nonNegative],
      coalHeatingValue: [loss.coalHeatingValue ?? this.defaultHeatingValue(DEFAULT_COAL_HEATING_VALUE_BTU_LB, settings), nonNegative],
      electrodeUse: [loss.electrodeUse ?? null, nonNegative],
      electrodeHeatingValue: [loss.electrodeHeatingValue ?? this.defaultHeatingValue(DEFAULT_ELECTRODE_HEATING_VALUE_BTU_LB, settings), nonNegative],
      otherFuels: [loss.otherFuels ?? null, nonNegative],
      electricityInput: [loss.electricityInput ?? null, nonNegative],
    });
  }

  buildEnergyInput(form: EnergyInputForm): EnergyInputEAF {
    const values = form.getRawValue();
    return {
      naturalGasHeatInput: values.naturalGasHeatInput ?? undefined,
      flowRateInput: values.flowRateInput ?? undefined,
      coalCarbonInjection: values.coalCarbonInjection ?? undefined,
      coalHeatingValue: values.coalHeatingValue ?? undefined,
      electrodeUse: values.electrodeUse ?? undefined,
      electrodeHeatingValue: values.electrodeHeatingValue ?? undefined,
      otherFuels: values.otherFuels ?? undefined,
      electricityInput: values.electricityInput ?? undefined,
    };
  }

  /**
   * @param flowRate scf/hr (Imperial) or Nm3/hr (Metric)
   * @returns heat input in MMBtu/hr (Imperial) or GJ/hr (Metric)
   */
  calculateHeatInputFromFlowRate(flowRate: number, settings: Settings): number {
    if (settings.unitsOfMeasure === 'Imperial') {
      return this.convertUnitsService.roundVal(flowRate * (NATURAL_GAS_HEATING_VALUE_BTU_SCF / BTU_PER_MMBTU), 3);
    }
    const flowRateScf = this.convertUnitsService.value(flowRate).from('m3').to('ft3');
    const heatInputMMBtu = flowRateScf * (NATURAL_GAS_HEATING_VALUE_BTU_SCF / BTU_PER_MMBTU);
    return this.convertUnitsService.roundVal(this.convertUnitsService.value(heatInputMMBtu).from('MMBtu').to('GJ'), 3);
  }

  private defaultHeatingValue(btuPerLb: number, settings?: Settings): number {
    return settings?.unitsOfMeasure === 'Metric'
      ? this.convertUnitsService.value(btuPerLb).from('btuLb').to('kJkg')
      : btuPerLb;
  }
}
