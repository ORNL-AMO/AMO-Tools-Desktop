import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CoolingLoss, GasCoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { Settings } from '../../../../shared/models/settings';

/** Saved `coolingLossType` values; Air and Water are stored as 'Gas' and 'Liquid'. */
export const CoolingMedium = {
  Air: 'Gas',
  Water: 'Liquid',
  OtherGas: 'Other Gas',
  OtherLiquid: 'Other Liquid',
} as const;
export type CoolingMedium = typeof CoolingMedium[keyof typeof CoolingMedium];
export type GasCoolingMedium = typeof CoolingMedium.Air | typeof CoolingMedium.OtherGas;
export type LiquidCoolingMedium = typeof CoolingMedium.Water | typeof CoolingMedium.OtherLiquid;

export type GasCoolingForm = FormGroup<{
  coolingLossType: FormControl<GasCoolingMedium>;
  coolingMedium: FormControl<string | null>;
  specificHeat: FormControl<number | null>;
  gasDensity: FormControl<number | null>;
  flowRate: FormControl<number | null>;
  inletTemp: FormControl<number | null>;
  outletTemp: FormControl<number | null>;
  correctionFactor: FormControl<number | null>;
}>;

export type LiquidCoolingForm = FormGroup<{
  coolingLossType: FormControl<LiquidCoolingMedium>;
  coolingMedium: FormControl<string | null>;
  specificHeat: FormControl<number | null>;
  density: FormControl<number | null>;
  flowRate: FormControl<number | null>;
  inletTemp: FormControl<number | null>;
  outletTemp: FormControl<number | null>;
  correctionFactor: FormControl<number | null>;
}>;

export type CoolingForm = GasCoolingForm | LiquidCoolingForm;

// Legacy defaults for Air and Water: specific heat Btu/(lb-°F) or kJ/(kg-°C); density lb/scf or kg/Nm³
// for air, lb/gal or kg/L for water. "Other" media start blank.
const AIR_DEFAULTS = { Imperial: { specificHeat: 0.2371, density: 0.074887 }, Metric: { specificHeat: 0.993, density: 1.2 } };
const WATER_DEFAULTS = { Imperial: { specificHeat: 1, density: 8.338 }, Metric: { specificHeat: 4.187, density: 0.999 } };

export function isGasMedium(medium: CoolingMedium | string | undefined): medium is GasCoolingMedium {
  return medium === CoolingMedium.Air || medium === CoolingMedium.OtherGas;
}

export function isLiquidMedium(medium: CoolingMedium | string | undefined): medium is LiquidCoolingMedium {
  return medium === CoolingMedium.Water || medium === CoolingMedium.OtherLiquid;
}

export function isGasCoolingForm(form: CoolingForm): form is GasCoolingForm {
  return isGasMedium(form.controls.coolingLossType.value);
}

/** Gas stores its outlet under both `finalTemperature` (what the calculation reads) and
 * `outletTemperature` (what the warnings check reads) — every writer keeps them mirrored via this. */
export function gasOutletTemperatureFields(value: number | undefined): Pick<GasCoolingLoss, 'finalTemperature' | 'outletTemperature'> {
  return { finalTemperature: value, outletTemperature: value };
}

@Injectable()
export class CoolingFormService {
  private readonly fb = inject(FormBuilder);

  /** Unrecognized or missing types load as Air, legacy's default for a new cooling loss. */
  getCoolingForm(loss: CoolingLoss = {}, settings: Settings): CoolingForm {
    const medium = loss.coolingLossType;
    if (isLiquidMedium(medium)) {
      return this.getLiquidCoolingForm(loss, medium, settings);
    }
    return this.getGasCoolingForm(loss, isGasMedium(medium) ? medium : CoolingMedium.Air, settings);
  }

  getGasCoolingForm(loss: CoolingLoss, medium: GasCoolingMedium, settings: Settings): GasCoolingForm {
    const gas = loss.gasCoolingLoss;
    const defaults = !gas && medium === CoolingMedium.Air ? AIR_DEFAULTS[unitsKey(settings)] : undefined;
    return this.fb.group({
      coolingLossType: this.fb.nonNullable.control<GasCoolingMedium>(medium),
      coolingMedium: [loss.coolingMedium ?? null],
      specificHeat: [gas?.specificHeat ?? defaults?.specificHeat ?? null, [Validators.required, Validators.min(0)]],
      gasDensity: [gas?.gasDensity ?? defaults?.density ?? null, [Validators.required, Validators.min(0)]],
      flowRate: [gas?.flowRate ?? null, [Validators.required, Validators.min(0)]],
      inletTemp: [gas?.initialTemperature ?? null, Validators.required],
      outletTemp: [gas?.finalTemperature ?? null, Validators.required],
      correctionFactor: [gas?.correctionFactor ?? 1.0, Validators.required],
    });
  }

  getLiquidCoolingForm(loss: CoolingLoss, medium: LiquidCoolingMedium, settings: Settings): LiquidCoolingForm {
    const liquid = loss.liquidCoolingLoss;
    const defaults = !liquid && medium === CoolingMedium.Water ? WATER_DEFAULTS[unitsKey(settings)] : undefined;
    return this.fb.group({
      coolingLossType: this.fb.nonNullable.control<LiquidCoolingMedium>(medium),
      coolingMedium: [loss.coolingMedium ?? null],
      specificHeat: [liquid?.specificHeat ?? defaults?.specificHeat ?? null, [Validators.required, Validators.min(0)]],
      density: [liquid?.density ?? defaults?.density ?? null, [Validators.required, Validators.min(0)]],
      flowRate: [liquid?.flowRate ?? null, [Validators.required, Validators.min(0)]],
      inletTemp: [liquid?.initialTemperature ?? null, Validators.required],
      outletTemp: [liquid?.outletTemperature ?? null, Validators.required],
      correctionFactor: [liquid?.correctionFactor ?? 1.0, Validators.required],
    });
  }

  buildCoolingLoss(form: CoolingForm): CoolingLoss {
    if (isGasCoolingForm(form)) {
      const v = form.getRawValue();
      return {
        coolingLossType: v.coolingLossType,
        coolingMedium: v.coolingMedium ?? undefined,
        gasCoolingLoss: {
          specificHeat: v.specificHeat ?? undefined,
          gasDensity: v.gasDensity ?? undefined,
          flowRate: v.flowRate ?? undefined,
          initialTemperature: v.inletTemp ?? undefined,
          ...gasOutletTemperatureFields(v.outletTemp ?? undefined),
          correctionFactor: v.correctionFactor ?? undefined,
        },
      };
    }
    const v = form.getRawValue();
    return {
      coolingLossType: v.coolingLossType,
      coolingMedium: v.coolingMedium ?? undefined,
      liquidCoolingLoss: {
        specificHeat: v.specificHeat ?? undefined,
        density: v.density ?? undefined,
        flowRate: v.flowRate ?? undefined,
        initialTemperature: v.inletTemp ?? undefined,
        outletTemperature: v.outletTemp ?? undefined,
        correctionFactor: v.correctionFactor ?? undefined,
      },
    };
  }
}

function unitsKey(settings: Settings): 'Imperial' | 'Metric' {
  return settings?.unitsOfMeasure === 'Metric' ? 'Metric' : 'Imperial';
}
