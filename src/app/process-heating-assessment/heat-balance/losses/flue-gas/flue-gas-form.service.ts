import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGas } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';

/** Saved `oxygenCalculationMethod` values. */
export const OxygenCalculationMethod = {
  ExcessAir: 'Excess Air',
  OxygenInFlueGas: 'Oxygen in Flue Gas',
} as const;
export type OxygenCalculationMethod = typeof OxygenCalculationMethod[keyof typeof OxygenCalculationMethod];

export const OXYGEN_CALCULATION_METHODS: OxygenCalculationMethod[] = Object.values(OxygenCalculationMethod);

/** Saved `flueGasType` values. */
export const FlueGasType = {
  ByVolume: 'By Volume',
  ByMass: 'By Mass',
} as const;
export type FlueGasType = typeof FlueGasType[keyof typeof FlueGasType];

/** Gas fractions (percent by volume) that make up a flue gas material. */
export const FLUE_GAS_COMPONENTS = ['CH4', 'C2H6', 'N2', 'H2', 'C3H8', 'C4H10_CnH2n', 'H2O', 'CO', 'CO2', 'SO2', 'O2'] as const;
export type FlueGasComponent = typeof FLUE_GAS_COMPONENTS[number];

/** Ultimate analysis fields (percent by mass) of a solid/liquid flue gas fuel. */
export const FLUE_GAS_FUEL_ANALYSIS = [
  { key: 'carbon', label: 'Carbon' },
  { key: 'hydrogen', label: 'Hydrogen' },
  { key: 'sulphur', label: 'Sulphur' },
  { key: 'inertAsh', label: 'Inert Ash' },
  { key: 'o2', label: 'O₂' },
  { key: 'moisture', label: 'Moisture' },
  { key: 'nitrogen', label: 'Nitrogen' },
] as const;

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

export type FlueGasMassForm = FormGroup<{
  materialId: FormControl<number | null>;
  flueGasTemperature: FormControl<number | null>;
  oxygenCalculationMethod: FormControl<OxygenCalculationMethod>;
  excessAirPercentage: FormControl<number | null>;
  o2InFlueGas: FormControl<number | null>;
  combustionAirTemperature: FormControl<number | null>;
  moistureInAirCombustion: FormControl<number | null>;
  fuelTemperature: FormControl<number | null>;
  ambientAirTemp: FormControl<number | null>;
  ashDischargeTemperature: FormControl<number | null>;
  unburnedCarbonInAsh: FormControl<number | null>;
  carbon: FormControl<number | null>;
  hydrogen: FormControl<number | null>;
  sulphur: FormControl<number | null>;
  inertAsh: FormControl<number | null>;
  o2: FormControl<number | null>;
  moisture: FormControl<number | null>;
  nitrogen: FormControl<number | null>;
  heatingValue: FormControl<number | null>;
}>;

export type FlueGasForm = FlueGasVolumeForm | FlueGasMassForm;

export function isFlueGasMassForm(form: FlueGasForm): form is FlueGasMassForm {
  return 'carbon' in form.controls;
}

/** Components summing outside this band of 100% are flagged in the add fuel modals, matching legacy. */
export const DIFFERENCE_TOLERANCE_PERCENT = 0.4;

export const PERCENT_VALIDATORS = [Validators.required, Validators.min(0), Validators.max(100)];
/** Legacy form's upper limit for O2 in flue gas (percent). */
const MAX_O2_IN_FLUE_GAS = 20.5;
const DEFAULT_TEMP_F = 65;
const DEFAULT_FLUE_GAS_TEMP_F = 212;
/** Percent moisture in combustion air (legacy default). */
const DEFAULT_MOISTURE_PERCENT = 0.0077;
/** Legacy default: the first entry in the flue gas material database. */
const DEFAULT_MATERIAL_ID = 1;
/** Legacy default: the first entry in the solid/liquid flue gas material database. */
const DEFAULT_MASS_MATERIAL_ID = 1;
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
      oxygenCalculationMethod: this.fb.nonNullable.control<OxygenCalculationMethod>(volume?.oxygenCalculationMethod ?? OxygenCalculationMethod.ExcessAir, Validators.required),
      excessAirPercentage: [volume?.excessAirPercentage ?? 0, [Validators.required, Validators.min(0)]],
      o2InFlueGas: [volume?.o2InFlueGas ?? 0, [Validators.required, Validators.min(0), Validators.max(MAX_O2_IN_FLUE_GAS)]],
      combustionAirTemperature: [volume?.combustionAirTemperature ?? defaultTemp, Validators.required],
      moistureInAirCombustion: [volume?.moistureInAirCombustion ?? DEFAULT_MOISTURE_PERCENT, [Validators.required, Validators.min(0), Validators.max(100)]],
      fuelTemperature: [volume?.fuelTemperature ?? defaultTemp, Validators.required],
      ambientAirTemp: [volume?.ambientAirTemp ?? defaultTemp, Validators.required],
      CH4: [volume?.CH4 ?? null, PERCENT_VALIDATORS],
      C2H6: [volume?.C2H6 ?? null, PERCENT_VALIDATORS],
      N2: [volume?.N2 ?? null, PERCENT_VALIDATORS],
      H2: [volume?.H2 ?? null, PERCENT_VALIDATORS],
      C3H8: [volume?.C3H8 ?? null, PERCENT_VALIDATORS],
      C4H10_CnH2n: [volume?.C4H10_CnH2n ?? null, PERCENT_VALIDATORS],
      H2O: [volume?.H2O ?? null, PERCENT_VALIDATORS],
      CO: [volume?.CO ?? null, PERCENT_VALIDATORS],
      CO2: [volume?.CO2 ?? null, PERCENT_VALIDATORS],
      SO2: [volume?.SO2 ?? null, PERCENT_VALIDATORS],
      O2: [volume?.O2 ?? null, PERCENT_VALIDATORS],
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
      flueGasType: FlueGasType.ByVolume,
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

  getFlueGasMassForm(loss: FlueGas = {}, settings: Settings): FlueGasMassForm {
    const mass = loss.flueGasByMass;
    const defaultTemp = this.toSettingsTemp(DEFAULT_TEMP_F, settings);
    const form: FlueGasMassForm = this.fb.group({
      materialId: [mass?.gasTypeId ?? DEFAULT_MASS_MATERIAL_ID, Validators.required],
      flueGasTemperature: [mass?.flueGasTemperature ?? this.toSettingsTemp(DEFAULT_FLUE_GAS_TEMP_F, settings), Validators.required],
      oxygenCalculationMethod: this.fb.nonNullable.control<OxygenCalculationMethod>(mass?.oxygenCalculationMethod ?? OxygenCalculationMethod.ExcessAir, Validators.required),
      excessAirPercentage: [mass?.excessAirPercentage ?? 0, [Validators.required, Validators.min(0)]],
      o2InFlueGas: [mass?.o2InFlueGas ?? 0, [Validators.required, Validators.min(0), Validators.max(MAX_O2_IN_FLUE_GAS)]],
      combustionAirTemperature: [mass?.combustionAirTemperature ?? defaultTemp, Validators.required],
      moistureInAirCombustion: [mass?.moistureInAirCombustion ?? DEFAULT_MOISTURE_PERCENT, [Validators.required, Validators.min(0), Validators.max(100)]],
      fuelTemperature: [mass?.fuelTemperature ?? defaultTemp, Validators.required],
      ambientAirTemp: [mass?.ambientAirTemp ?? defaultTemp, Validators.required],
      ashDischargeTemperature: [mass?.ashDischargeTemperature ?? 0, Validators.required],
      unburnedCarbonInAsh: [mass?.unburnedCarbonInAsh ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      carbon: [mass?.carbon ?? null, PERCENT_VALIDATORS],
      hydrogen: [mass?.hydrogen ?? null, PERCENT_VALIDATORS],
      sulphur: [mass?.sulphur ?? null, PERCENT_VALIDATORS],
      inertAsh: [mass?.inertAsh ?? null, PERCENT_VALIDATORS],
      o2: [mass?.o2 ?? null, PERCENT_VALIDATORS],
      moisture: [mass?.moisture ?? null, PERCENT_VALIDATORS],
      nitrogen: [mass?.nitrogen ?? null, PERCENT_VALIDATORS],
      heatingValue: [mass?.heatingValue ?? null],
    });
    return this.setTemperatureValidators(form);
  }

  buildFlueGasMassLoss(form: FlueGasMassForm, name: string = DEFAULT_FLUE_GAS_NAME): FlueGas {
    const v = form.getRawValue();
    return {
      name,
      flueGasType: FlueGasType.ByMass,
      flueGasByMass: {
        gasTypeId: v.materialId ?? undefined,
        flueGasTemperature: v.flueGasTemperature ?? undefined,
        oxygenCalculationMethod: v.oxygenCalculationMethod,
        excessAirPercentage: v.excessAirPercentage ?? undefined,
        o2InFlueGas: v.o2InFlueGas ?? undefined,
        ambientAirTemp: v.ambientAirTemp ?? undefined,
        combustionAirTemperature: v.combustionAirTemperature ?? undefined,
        fuelTemperature: v.fuelTemperature ?? undefined,
        ashDischargeTemperature: v.ashDischargeTemperature ?? undefined,
        moistureInAirCombustion: v.moistureInAirCombustion ?? undefined,
        unburnedCarbonInAsh: v.unburnedCarbonInAsh ?? undefined,
        carbon: v.carbon ?? undefined,
        hydrogen: v.hydrogen ?? undefined,
        sulphur: v.sulphur ?? undefined,
        inertAsh: v.inertAsh ?? undefined,
        o2: v.o2 ?? undefined,
        moisture: v.moisture ?? undefined,
        nitrogen: v.nitrogen ?? undefined,
        heatingValue: v.heatingValue ?? undefined,
      },
    };
  }

  buildLoss(form: FlueGasForm, name: string = DEFAULT_FLUE_GAS_NAME): FlueGas {
    return isFlueGasMassForm(form) ? this.buildFlueGasMassLoss(form, name) : this.buildFlueGasLoss(form, name);
  }

  /** Flue gas temperature can't fall below combustion air temperature, and vice versa. */
  setTemperatureValidators<T extends FlueGasForm>(form: T): T {
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
