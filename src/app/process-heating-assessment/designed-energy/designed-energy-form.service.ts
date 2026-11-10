import { inject, Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { OperatingHours } from '../../shared/models/operations';
import { DesignedEnergy, DesignedEnergyElectricity, DesignedEnergyFuel, DesignedEnergySteam, DesignedZone } from '../../shared/models/phast/designedEnergy';
import { EnergySource, EnergySourceSelection, onlySourceOn } from '../energy-validation/default-energy-sources';
import { ENERGY_INPUT_VALIDATORS } from '../energy-validation/energy-input-validators';

export type DesignedFuelForm = FormGroup<{
  totalBurnerCapacity: FormControl<number | null>;
  percentCapacityUsed: FormControl<number | null>;
  operatingHours: FormControl<number | null>;
  operatingHoursCalc: FormControl<OperatingHours | undefined>;
}>;

export type DesignedSteamForm = FormGroup<{
  totalHeat: FormControl<number | null>;
  steamFlow: FormControl<number | null>;
  percentCapacityUsed: FormControl<number | null>;
  operatingHours: FormControl<number | null>;
  operatingHoursCalc: FormControl<OperatingHours | undefined>;
}>;

export type DesignedElectricityForm = FormGroup<{
  kwRating: FormControl<number | null>;
  percentCapacityUsed: FormControl<number | null>;
  operatingHours: FormControl<number | null>;
  operatingHoursCalc: FormControl<OperatingHours | undefined>;
}>;

export type DesignedZoneForm = FormGroup<{
  name: FormControl<string>;
  designedEnergyFuel: DesignedFuelForm;
  designedEnergySteam: DesignedSteamForm;
  designedEnergyElectricity: DesignedElectricityForm;
}>;

export type DesignedEnergyForm = FormGroup<{
  fuel: FormControl<boolean>;
  steam: FormControl<boolean>;
  electricity: FormControl<boolean>;
  zones: FormArray<DesignedZoneForm>;
}>;

const SOURCE_GROUP = {
  fuel: 'designedEnergyFuel',
  steam: 'designedEnergySteam',
  electricity: 'designedEnergyElectricity',
} as const;

const SOURCES = Object.keys(SOURCE_GROUP) as EnergySource[];

function emptyFuel(): DesignedEnergyFuel {
  return { fuelType: 0, percentCapacityUsed: 0, totalBurnerCapacity: 0, operatingHours: 0 };
}

function emptySteam(): DesignedEnergySteam {
  return { totalHeat: 0, steamFlow: 0, percentCapacityUsed: 0, operatingHours: 0 };
}

function emptyElectricity(): DesignedEnergyElectricity {
  return { kwRating: 0, percentCapacityUsed: 0, operatingHours: 0 };
}

/**
 * Builds and serializes the Designed Energy form. A turned-off source's group is disabled in every
 * zone and saves as zeroed inputs: the designed total adds all three sources of every zone
 * regardless of which are turned on, so anything else would leak into the result.
 */
@Injectable()
export class DesignedEnergyFormService {
  private readonly fb = inject(FormBuilder);

  /**
   * @param saved the baseline's saved designed energy, if any
   * @param defaults sources to turn on when nothing is saved yet
   */
  getForm(saved: DesignedEnergy | undefined, defaults: EnergySourceSelection): DesignedEnergyForm {
    const sources: EnergySourceSelection = saved
      ? { fuel: !!saved.fuel, steam: !!saved.steam, electricity: !!saved.electricity }
      : defaults;
    const zones = saved ? saved.zones ?? [] : [undefined];
    const form: DesignedEnergyForm = this.fb.group({
      fuel: this.fb.nonNullable.control(sources.fuel),
      steam: this.fb.nonNullable.control(sources.steam),
      electricity: this.fb.nonNullable.control(sources.electricity),
      zones: this.fb.array(zones.map((zone, index) => this.getZoneForm(zone, index, sources))),
    });
    form.updateValueAndValidity();
    return form;
  }

  /** Turning a source off clears its inputs in every zone, as legacy does. The last source on can't be turned off. */
  setSourceEnabled(form: DesignedEnergyForm, source: EnergySource, enabled: boolean): void {
    if (!enabled && this.lockedSource(form) === source) return;
    form.controls[source].setValue(enabled, { emitEvent: false });
    form.controls.zones.controls.forEach(zone => this.setZoneSourceEnabled(zone, source, enabled));
    form.updateValueAndValidity();
  }

  lockedSource(form: DesignedEnergyForm): EnergySource | undefined {
    const { fuel, steam, electricity } = form.controls;
    return onlySourceOn({ fuel: fuel.value, steam: steam.value, electricity: electricity.value });
  }

  addZone(form: DesignedEnergyForm): void {
    const { zones, fuel, steam, electricity } = form.controls;
    zones.push(this.getZoneForm(undefined, zones.length, { fuel: fuel.value, steam: steam.value, electricity: electricity.value }));
  }

  removeZone(form: DesignedEnergyForm, index: number): void {
    form.controls.zones.removeAt(index);
  }

  isValid(saved: DesignedEnergy | undefined, defaults: EnergySourceSelection): boolean {
    return !saved || this.getForm(saved, defaults).valid;
  }

  toDesignedEnergy(form: DesignedEnergyForm): DesignedEnergy {
    const { fuel, steam, electricity, zones } = form.controls;
    return {
      fuel: fuel.value,
      steam: steam.value,
      electricity: electricity.value,
      zones: zones.controls.map(zone => this.toZone(zone, { fuel: fuel.value, steam: steam.value, electricity: electricity.value })),
    };
  }

  /** Blank inputs save as undefined, like the heat balance forms, so results show dashes rather than a zero. */
  private toZone(zone: DesignedZoneForm, sources: EnergySourceSelection): DesignedZone {
    const { name, designedEnergyFuel: fuel, designedEnergySteam: steam, designedEnergyElectricity: electricity } = zone.getRawValue();
    return {
      name,
      designedEnergyFuel: sources.fuel ? {
        ...emptyFuel(),
        totalBurnerCapacity: fuel.totalBurnerCapacity ?? undefined,
        percentCapacityUsed: fuel.percentCapacityUsed ?? undefined,
        operatingHours: fuel.operatingHours ?? undefined,
        operatingHoursCalc: fuel.operatingHoursCalc,
      } : emptyFuel(),
      designedEnergySteam: sources.steam ? {
        ...emptySteam(),
        totalHeat: steam.totalHeat ?? undefined,
        steamFlow: steam.steamFlow ?? undefined,
        percentCapacityUsed: steam.percentCapacityUsed ?? undefined,
        operatingHours: steam.operatingHours ?? undefined,
        operatingHoursCalc: steam.operatingHoursCalc,
      } : emptySteam(),
      designedEnergyElectricity: sources.electricity ? {
        ...emptyElectricity(),
        kwRating: electricity.kwRating ?? undefined,
        percentCapacityUsed: electricity.percentCapacityUsed ?? undefined,
        operatingHours: electricity.operatingHours ?? undefined,
        operatingHoursCalc: electricity.operatingHoursCalc,
      } : emptyElectricity(),
    };
  }

  private setZoneSourceEnabled(zone: DesignedZoneForm, source: EnergySource, enabled: boolean): void {
    const group = zone.controls[SOURCE_GROUP[source]];
    if (enabled) {
      group.enable({ emitEvent: false });
    } else {
      group.reset(undefined, { emitEvent: false });
      group.disable({ emitEvent: false });
    }
  }

  private getZoneForm(zone: DesignedZone | undefined, index: number, sources: EnergySourceSelection): DesignedZoneForm {
    const fuel = sources.fuel ? zone?.designedEnergyFuel : undefined;
    const steam = sources.steam ? zone?.designedEnergySteam : undefined;
    const electricity = sources.electricity ? zone?.designedEnergyElectricity : undefined;
    const zoneForm: DesignedZoneForm = this.fb.group({
      name: this.fb.nonNullable.control(zone?.name ?? `Zone #${index + 1}`),
      designedEnergyFuel: this.fb.group({
        totalBurnerCapacity: this.fb.control<number | null>(fuel?.totalBurnerCapacity ?? null, ENERGY_INPUT_VALIDATORS),
        percentCapacityUsed: this.fb.control<number | null>(fuel?.percentCapacityUsed ?? null, ENERGY_INPUT_VALIDATORS),
        operatingHours: this.fb.control<number | null>(fuel?.operatingHours ?? null, ENERGY_INPUT_VALIDATORS),
        operatingHoursCalc: this.fb.control<OperatingHours | undefined>(fuel?.operatingHoursCalc),
      }),
      designedEnergySteam: this.fb.group({
        totalHeat: this.fb.control<number | null>(steam?.totalHeat ?? null, ENERGY_INPUT_VALIDATORS),
        steamFlow: this.fb.control<number | null>(steam?.steamFlow ?? null, ENERGY_INPUT_VALIDATORS),
        percentCapacityUsed: this.fb.control<number | null>(steam?.percentCapacityUsed ?? null, ENERGY_INPUT_VALIDATORS),
        operatingHours: this.fb.control<number | null>(steam?.operatingHours ?? null, ENERGY_INPUT_VALIDATORS),
        operatingHoursCalc: this.fb.control<OperatingHours | undefined>(steam?.operatingHoursCalc),
      }),
      designedEnergyElectricity: this.fb.group({
        kwRating: this.fb.control<number | null>(electricity?.kwRating ?? null, ENERGY_INPUT_VALIDATORS),
        percentCapacityUsed: this.fb.control<number | null>(electricity?.percentCapacityUsed ?? null, ENERGY_INPUT_VALIDATORS),
        operatingHours: this.fb.control<number | null>(electricity?.operatingHours ?? null, ENERGY_INPUT_VALIDATORS),
        operatingHoursCalc: this.fb.control<OperatingHours | undefined>(electricity?.operatingHoursCalc),
      }),
    });
    SOURCES.forEach(source => this.setZoneSourceEnabled(zoneForm, source, sources[source]));
    return zoneForm;
  }
}
