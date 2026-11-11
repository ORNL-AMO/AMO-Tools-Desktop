import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { OperatingHours } from '../../shared/models/operations';
import { MeteredEnergy, MeteredEnergyElectricity, MeteredEnergyFuel, MeteredEnergySteam } from '../../shared/models/phast/meteredEnergy';
import { EnergySource, EnergySourceSelection, onlySourceOn } from '../energy-validation/default-energy-sources';
import { ENERGY_INPUT_VALIDATORS } from '../energy-validation/energy-input-validators';

export type FuelDescription = 'gas' | 'solidLiquid';

/** Btu per MMBtu (imperial), also kJ per GJ (metric). */
const BTU_PER_MMBTU = 1_000_000;

export type MeteredFuelForm = FormGroup<{
  fuelDescription: FormControl<FuelDescription>;
  fuelType: FormControl<number | null>;
  heatingValue: FormControl<number | null>;
  fuelFlowRateInput: FormControl<number | null>;
  userDefinedMeteredEnergy: FormControl<boolean>;
  fuelEnergy: FormControl<number | null>;
  collectionTime: FormControl<number | null>;
  operatingHours: FormControl<number | null>;
  operatingHoursCalc: FormControl<OperatingHours | undefined>;
}>;

export type MeteredSteamForm = FormGroup<{
  totalHeatSteam: FormControl<number | null>;
  flowRate: FormControl<number | null>;
  collectionTime: FormControl<number | null>;
  operatingHours: FormControl<number | null>;
  operatingHoursCalc: FormControl<OperatingHours | undefined>;
}>;

export type MeteredElectricityForm = FormGroup<{
  electricityUsed: FormControl<number | null>;
  electricityCollectionTime: FormControl<number | null>;
  operatingHours: FormControl<number | null>;
  operatingHoursCalc: FormControl<OperatingHours | undefined>;
}>;

export type MeteredEnergyForm = FormGroup<{
  fuel: FormControl<boolean>;
  steam: FormControl<boolean>;
  electricity: FormControl<boolean>;
  meteredEnergyFuel: MeteredFuelForm;
  meteredEnergySteam: MeteredSteamForm;
  meteredEnergyElectricity: MeteredElectricityForm;
}>;

const SOURCE_GROUP = {
  fuel: 'meteredEnergyFuel',
  steam: 'meteredEnergySteam',
  electricity: 'meteredEnergyElectricity',
} as const;

function emptyFuel(): MeteredEnergyFuel {
  return { fuelDescription: 'gas', fuelType: 0, heatingValue: 0, collectionTime: 0, electricityUsed: 0, electricityCollectionTime: 0, fuelEnergy: 0, operatingHours: 0 };
}

function emptySteam(): MeteredEnergySteam {
  return { totalHeatSteam: 0, flowRate: 0, collectionTime: 0, electricityUsed: 0, electricityCollectionTime: 0, operatingHours: 0 };
}

function emptyElectricity(): MeteredEnergyElectricity {
  return { electricityCollectionTime: 0, electricityUsed: 0, auxElectricityUsed: 0, auxElectricityCollectionTime: 0, operatingHours: 0 };
}

/**
 * Legacy saves fuel inputs without `userDefinedMeteredEnergy` until it is toggled, and omits a flow rate
 * that was never entered, which it calculates as 0; this module always saves the toggle.
 */
function isLegacyFuel(fuel: MeteredEnergyFuel | undefined): boolean {
  return !!fuel && fuel.userDefinedMeteredEnergy === undefined;
}

/**
 * @returns fuel energy over the collection period, in MMBtu (imperial) or GJ (metric)
 */
export function calculateMeteredFuelEnergy(flowRate: number | null, heatingValue: number | null, collectionTime: number | null): number | null {
  if (flowRate == null || heatingValue == null || collectionTime == null) return null;
  return flowRate * heatingValue * collectionTime / BTU_PER_MMBTU;
}

/**
 * Builds and serializes the Metered Energy form. A turned-off source's group is disabled, so its
 * validators don't apply, and saves as legacy's zeroed inputs.
 */
@Injectable()
export class MeteredEnergyFormService {
  private readonly fb = inject(FormBuilder);

  /**
   * @param saved the baseline's saved metered energy, if any
   * @param defaults sources to turn on when nothing is saved yet
   */
  getForm(saved: MeteredEnergy | undefined, defaults: EnergySourceSelection): MeteredEnergyForm {
    const sources: EnergySourceSelection = saved
      ? { fuel: !!saved.fuel, steam: !!saved.steam, electricity: !!saved.electricity }
      : defaults;
    const form: MeteredEnergyForm = this.fb.group({
      fuel: this.fb.nonNullable.control(sources.fuel),
      steam: this.fb.nonNullable.control(sources.steam),
      electricity: this.fb.nonNullable.control(sources.electricity),
      meteredEnergyFuel: this.getFuelForm(sources.fuel ? saved?.meteredEnergyFuel : undefined),
      meteredEnergySteam: this.getSteamForm(sources.steam ? saved?.meteredEnergySteam : undefined),
      meteredEnergyElectricity: this.getElectricityForm(sources.electricity ? saved?.meteredEnergyElectricity : undefined),
    });
    (Object.keys(SOURCE_GROUP) as EnergySource[]).forEach(source => this.setSourceEnabled(form, source, sources[source]));
    return form;
  }

  /** Turning a source off clears its inputs, as legacy does. The last source on can't be turned off. */
  setSourceEnabled(form: MeteredEnergyForm, source: EnergySource, enabled: boolean): void {
    if (!enabled && this.lockedSource(form) === source) return;
    const group = form.controls[SOURCE_GROUP[source]];
    form.controls[source].setValue(enabled, { emitEvent: false });
    if (enabled) {
      group.enable({ emitEvent: false });
      if (source === 'fuel') this.setFuelEnergyUserDefined(form.controls.meteredEnergyFuel, form.controls.meteredEnergyFuel.controls.userDefinedMeteredEnergy.value);
    } else {
      group.reset(undefined, { emitEvent: false });
      group.disable({ emitEvent: false });
    }
    form.updateValueAndValidity();
  }

  lockedSource(form: MeteredEnergyForm): EnergySource | undefined {
    const { fuel, steam, electricity } = form.controls;
    return onlySourceOn({ fuel: fuel.value, steam: steam.value, electricity: electricity.value });
  }

  /** Either the flow rate derives the fuel energy, or the user enters the energy directly. */
  setFuelEnergyUserDefined(fuelForm: MeteredFuelForm, userDefined: boolean): void {
    const { userDefinedMeteredEnergy, fuelEnergy, fuelFlowRateInput } = fuelForm.controls;
    userDefinedMeteredEnergy.setValue(userDefined, { emitEvent: false });
    if (userDefined) {
      fuelEnergy.enable({ emitEvent: false });
      fuelFlowRateInput.disable({ emitEvent: false });
    } else {
      fuelEnergy.disable({ emitEvent: false });
      fuelFlowRateInput.enable({ emitEvent: false });
    }
    fuelForm.updateValueAndValidity();
  }

  isValid(saved: MeteredEnergy | undefined, defaults: EnergySourceSelection): boolean {
    return !saved || this.getForm(saved, defaults).valid;
  }

  toMeteredEnergy(form: MeteredEnergyForm): MeteredEnergy {
    const { fuel, steam, electricity } = form.controls;
    return {
      fuel: fuel.value,
      steam: steam.value,
      electricity: electricity.value,
      meteredEnergyFuel: fuel.value ? this.toFuel(form.controls.meteredEnergyFuel) : emptyFuel(),
      meteredEnergySteam: steam.value ? this.toSteam(form.controls.meteredEnergySteam) : emptySteam(),
      meteredEnergyElectricity: electricity.value ? this.toElectricity(form.controls.meteredEnergyElectricity) : emptyElectricity(),
    };
  }

  /** Blank inputs save as undefined, like the heat balance forms, so results show dashes rather than a zero. */
  private toFuel(fuelForm: MeteredFuelForm): MeteredEnergyFuel {
    const v = fuelForm.getRawValue();
    const fuelEnergy = v.userDefinedMeteredEnergy
      ? v.fuelEnergy
      : calculateMeteredFuelEnergy(v.fuelFlowRateInput, v.heatingValue, v.collectionTime);
    return {
      ...emptyFuel(),
      fuelDescription: v.fuelDescription,
      fuelType: v.fuelType ?? undefined,
      heatingValue: v.heatingValue ?? undefined,
      fuelFlowRateInput: v.fuelFlowRateInput ?? undefined,
      userDefinedMeteredEnergy: v.userDefinedMeteredEnergy,
      fuelEnergy: fuelEnergy ?? undefined,
      collectionTime: v.collectionTime ?? undefined,
      operatingHours: v.operatingHours ?? undefined,
      operatingHoursCalc: v.operatingHoursCalc,
    };
  }

  private toSteam(steamForm: MeteredSteamForm): MeteredEnergySteam {
    const v = steamForm.getRawValue();
    return {
      ...emptySteam(),
      totalHeatSteam: v.totalHeatSteam ?? undefined,
      flowRate: v.flowRate ?? undefined,
      collectionTime: v.collectionTime ?? undefined,
      operatingHours: v.operatingHours ?? undefined,
      operatingHoursCalc: v.operatingHoursCalc,
    };
  }

  private toElectricity(electricityForm: MeteredElectricityForm): MeteredEnergyElectricity {
    const v = electricityForm.getRawValue();
    return {
      ...emptyElectricity(),
      electricityUsed: v.electricityUsed ?? undefined,
      electricityCollectionTime: v.electricityCollectionTime ?? undefined,
      operatingHours: v.operatingHours ?? undefined,
      operatingHoursCalc: v.operatingHoursCalc,
    };
  }

  private getFuelForm(fuel: MeteredEnergyFuel | undefined): MeteredFuelForm {
    return this.fb.group({
      fuelDescription: this.fb.nonNullable.control<FuelDescription>((fuel?.fuelDescription as FuelDescription) ?? 'gas'),
      fuelType: this.fb.control<number | null>(fuel?.fuelType ?? null),
      heatingValue: this.fb.control<number | null>(fuel?.heatingValue ?? null, ENERGY_INPUT_VALIDATORS),
      fuelFlowRateInput: this.fb.control<number | null>(fuel?.fuelFlowRateInput ?? (isLegacyFuel(fuel) ? 0 : null), ENERGY_INPUT_VALIDATORS),
      userDefinedMeteredEnergy: this.fb.nonNullable.control(!!fuel?.userDefinedMeteredEnergy),
      fuelEnergy: this.fb.control<number | null>(fuel?.fuelEnergy ?? null, ENERGY_INPUT_VALIDATORS),
      collectionTime: this.fb.control<number | null>(fuel?.collectionTime ?? null, ENERGY_INPUT_VALIDATORS),
      operatingHours: this.fb.control<number | null>(fuel?.operatingHours ?? null, ENERGY_INPUT_VALIDATORS),
      operatingHoursCalc: this.fb.control<OperatingHours | undefined>(fuel?.operatingHoursCalc),
    });
  }

  private getSteamForm(steam: MeteredEnergySteam | undefined): MeteredSteamForm {
    return this.fb.group({
      totalHeatSteam: this.fb.control<number | null>(steam?.totalHeatSteam ?? null, ENERGY_INPUT_VALIDATORS),
      flowRate: this.fb.control<number | null>(steam?.flowRate ?? null, ENERGY_INPUT_VALIDATORS),
      collectionTime: this.fb.control<number | null>(steam?.collectionTime ?? null, ENERGY_INPUT_VALIDATORS),
      operatingHours: this.fb.control<number | null>(steam?.operatingHours ?? null, ENERGY_INPUT_VALIDATORS),
      operatingHoursCalc: this.fb.control<OperatingHours | undefined>(steam?.operatingHoursCalc),
    });
  }

  private getElectricityForm(electricity: MeteredEnergyElectricity | undefined): MeteredElectricityForm {
    return this.fb.group({
      electricityUsed: this.fb.control<number | null>(electricity?.electricityUsed ?? null, ENERGY_INPUT_VALIDATORS),
      electricityCollectionTime: this.fb.control<number | null>(electricity?.electricityCollectionTime ?? null, ENERGY_INPUT_VALIDATORS),
      operatingHours: this.fb.control<number | null>(electricity?.operatingHours ?? null, ENERGY_INPUT_VALIDATORS),
      operatingHoursCalc: this.fb.control<OperatingHours | undefined>(electricity?.operatingHoursCalc),
    });
  }
}
