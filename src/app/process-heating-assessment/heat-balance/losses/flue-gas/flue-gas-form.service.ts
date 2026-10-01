import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGas, FlueGasByVolume } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';

export type OxygenCalculationMethod = NonNullable<FlueGasByVolume['oxygenCalculationMethod']>;

export const OXYGEN_CALCULATION_METHODS: OxygenCalculationMethod[] = ['Excess Air', 'Oxygen in Flue Gas'];

/** Gas fractions (percent by volume) that make up a flue gas material. */
export const FLUE_GAS_COMPONENTS = ['CH4', 'C2H6', 'N2', 'H2', 'C3H8', 'C4H10_CnH2n', 'H2O', 'CO', 'CO2', 'SO2', 'O2'] as const;
export type FlueGasComponent = typeof FLUE_GAS_COMPONENTS[number];

export type FlueGasVolumeForm = FormGroup<Record<FlueGasComponent, FormControl<number | null>> & {
  materialId: FormControl<number | null>;
  flueGasTemperature: FormControl<number | null>;
  oxygenCalculationMethod: FormControl<OxygenCalculationMethod>;
  excessAirPercentage: FormControl<number | null>;
  o2InFlueGas: FormControl<number | null>;
  combustionAirTemperature: FormControl<number | null>;
  moistureInAirCombustion: FormControl<number | null>;
  fuelTemperature: FormControl<number | null>;
  ambientAirTemp: FormControl<number | null>;
  specificGravity: FormControl<number | null>;
  heatingValue: FormControl<number | null>;
  heatingValueVolume: FormControl<number | null>;
}>;

const DEFAULT_TEMP_F = 65;
const DEFAULT_FLUE_GAS_TEMP_F = 212;
/** Percent moisture in combustion air (legacy default). */
const DEFAULT_MOISTURE_PERCENT = 0.0077;
/** First default entry in the flue gas material database (natural gas). */
const DEFAULT_MATERIAL_ID = 1;
export const DEFAULT_FLUE_GAS_NAME = 'Flue Gas';

@Injectable()
export class FlueGasFormService {
  private readonly fb = inject(FormBuilder);
  private readonly convertUnitsService = inject(ConvertUnitsService);

  getFlueGasVolumeForm(loss: FlueGas = {}, settings: Settings): FlueGasVolumeForm {
    const volume = loss.flueGasByVolume;
    const defaultTemp = this.toSettingsTemp(DEFAULT_TEMP_F, settings);
    const form: FlueGasVolumeForm = this.fb.group({
      materialId: [volume?.gasTypeId ?? DEFAULT_MATERIAL_ID, Validators.required],
      flueGasTemperature: [volume?.flueGasTemperature ?? this.toSettingsTemp(DEFAULT_FLUE_GAS_TEMP_F, settings), Validators.required],
      oxygenCalculationMethod: this.fb.nonNullable.control<OxygenCalculationMethod>(volume?.oxygenCalculationMethod ?? 'Excess Air', Validators.required),
      excessAirPercentage: [volume?.excessAirPercentage ?? 0, Validators.required],
      o2InFlueGas: [volume?.o2InFlueGas ?? 0, Validators.required],
      combustionAirTemperature: [volume?.combustionAirTemperature ?? defaultTemp, Validators.required],
      moistureInAirCombustion: [volume?.moistureInAirCombustion ?? DEFAULT_MOISTURE_PERCENT, [Validators.required, Validators.min(0), Validators.max(100)]],
      fuelTemperature: [volume?.fuelTemperature ?? defaultTemp, Validators.required],
      ambientAirTemp: [volume?.ambientAirTemp ?? defaultTemp, Validators.required],
      CH4: [volume?.CH4 ?? null, Validators.required],
      C2H6: [volume?.C2H6 ?? null, Validators.required],
      N2: [volume?.N2 ?? null, Validators.required],
      H2: [volume?.H2 ?? null, Validators.required],
      C3H8: [volume?.C3H8 ?? null, Validators.required],
      C4H10_CnH2n: [volume?.C4H10_CnH2n ?? null, Validators.required],
      H2O: [volume?.H2O ?? null, Validators.required],
      CO: [volume?.CO ?? null, Validators.required],
      CO2: [volume?.CO2 ?? null, Validators.required],
      SO2: [volume?.SO2 ?? null, Validators.required],
      O2: [volume?.O2 ?? null, Validators.required],
      specificGravity: [volume?.specificGravity ?? null],
      heatingValue: [volume?.heatingValue ?? null],
      heatingValueVolume: [volume?.heatingValueVolume ?? null],
    });
    return this.setTemperatureValidators(form);
  }

  buildFlueGasLoss(form: FlueGasVolumeForm, name: string = DEFAULT_FLUE_GAS_NAME): FlueGas {
    const v = form.getRawValue();
    return {
      name,
      flueGasType: 'By Volume',
      flueGasByVolume: {
        gasTypeId: v.materialId ?? undefined,
        flueGasTemperature: v.flueGasTemperature ?? undefined,
        oxygenCalculationMethod: v.oxygenCalculationMethod,
        excessAirPercentage: v.excessAirPercentage ?? undefined,
        o2InFlueGas: v.o2InFlueGas ?? undefined,
        ambientAirTemp: v.ambientAirTemp ?? undefined,
        combustionAirTemperature: v.combustionAirTemperature ?? undefined,
        moistureInAirCombustion: v.moistureInAirCombustion ?? undefined,
        fuelTemperature: v.fuelTemperature ?? undefined,
        CH4: v.CH4 ?? undefined,
        C2H6: v.C2H6 ?? undefined,
        N2: v.N2 ?? undefined,
        H2: v.H2 ?? undefined,
        C3H8: v.C3H8 ?? undefined,
        C4H10_CnH2n: v.C4H10_CnH2n ?? undefined,
        H2O: v.H2O ?? undefined,
        CO: v.CO ?? undefined,
        CO2: v.CO2 ?? undefined,
        SO2: v.SO2 ?? undefined,
        O2: v.O2 ?? undefined,
        heatingValue: v.heatingValue ?? undefined,
        heatingValueVolume: v.heatingValueVolume ?? undefined,
        specificGravity: v.specificGravity ?? undefined,
      },
    };
  }

  setTemperatureValidators(form: FlueGasVolumeForm): FlueGasVolumeForm {
    const { flueGasTemperature, combustionAirTemperature } = form.controls;
    flueGasTemperature.setValidators(this.withBound(Validators.min, combustionAirTemperature.value));
    combustionAirTemperature.setValidators(this.withBound(Validators.max, flueGasTemperature.value));
    [flueGasTemperature, combustionAirTemperature].forEach(control => {
      control.markAsDirty();
      control.updateValueAndValidity({ emitEvent: false });
    });
    return form;
  }

  private withBound(validator: (bound: number) => ReturnType<typeof Validators.min>, bound: number | null) {
    return bound !== null ? [Validators.required, validator(bound)] : [Validators.required];
  }

  private toSettingsTemp(fahrenheit: number, settings: Settings): number {
    return settings?.unitsOfMeasure === 'Metric'
      ? this.convertUnitsService.value(fahrenheit).from('F').to('C')
      : fahrenheit;
  }
}
