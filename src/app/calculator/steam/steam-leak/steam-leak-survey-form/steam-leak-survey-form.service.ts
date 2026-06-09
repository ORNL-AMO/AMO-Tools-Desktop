import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';
import {
  FacilitySteamLeakData,
  SteamLeakEstimateMethodData,
  SteamLeakOrificeMethodData,
  SteamLeakPlumeMethodData,
  SteamLeakSurveyData,
} from '../../../../shared/models/standalone';
import { SteamLeakMeasurementMethod } from '../steam-leak-constants';

const HOURS_PER_YEAR = 8760;

export interface LeakMetaFormControls {
  selected: FormControl<boolean | null>;
  name: FormControl<string | null>;
  leakDescription: FormControl<string | null>;
  measurementMethod: FormControl<number | null>;
  units: FormControl<number | null>;
}

export interface EstimateFormControls {
  steamPressure: FormControl<number | null>;
  steamTemperature: FormControl<number | null>;
  pressureReductionMethod: FormControl<number | null>;
  turbineEfficiency: FormControl<number | null>;
  leakRate: FormControl<number | null>;
}

export interface OrificeFormControls {
  holeSize: FormControl<number | null>;
  dischargeCoefficient: FormControl<number | null>;
  atmosphericPressure: FormControl<number | null>;
  steamPressure: FormControl<number | null>;
  steamTemperature: FormControl<number | null>;
  pressureReductionMethod: FormControl<number | null>;
  turbineEfficiency: FormControl<number | null>;
}

export interface PlumeFormControls {
  steamPressure: FormControl<number | null>;
  steamTemperature: FormControl<number | null>;
  ambientTemperature: FormControl<number | null>;
  plumeLength: FormControl<number | null>;
  pressureReductionMethod: FormControl<number | null>;
  turbineEfficiency: FormControl<number | null>;
}

export interface FacilitySteamLeakFormControls {
  annualOperatingHours: FormControl<number | null>;
  utilityType: FormControl<number | null>;
  steamCost: FormControl<number | null>;
  steamTemperature: FormControl<number | null>;
  steamPressure: FormControl<number | null>;
  feedwaterTemperature: FormControl<number | null>;
  fuelCost: FormControl<number | null>;
  fuelEnergyFactor: FormControl<number | null>;
  electricityCost: FormControl<number | null>;
  boilerEfficiency: FormControl<number | null>;
  systemEfficiency: FormControl<number | null>;
}

@Injectable()
export class SteamLeakSurveyFormService {
  private readonly fb = inject(FormBuilder);

  buildLeakMetaForm(leak: SteamLeakSurveyData): FormGroup<LeakMetaFormControls> {
    return this.fb.group<LeakMetaFormControls>({
      selected: new FormControl(leak.selected),
      name: new FormControl(leak.name, [Validators.required]),
      leakDescription: new FormControl(leak.leakDescription, [Validators.required]),
      measurementMethod: new FormControl(leak.measurementMethod),
      units: new FormControl(leak.units),
    });
  }

  buildEstimateForm(leak: SteamLeakSurveyData): FormGroup<EstimateFormControls> {
    return this.fb.group<EstimateFormControls>({
      steamPressure: new FormControl(leak.estimateMethodData.steamPressure, [Validators.required, Validators.min(115), Validators.max(415)]),
      steamTemperature: new FormControl(leak.estimateMethodData.steamTemperature, [Validators.required, Validators.min(212)]),
      pressureReductionMethod: new FormControl(leak.estimateMethodData.pressureReductionMethod),
      turbineEfficiency: new FormControl(leak.estimateMethodData.turbineEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
      leakRate: new FormControl(leak.estimateMethodData.leakRate, [Validators.required, GreaterThanValidator.greaterThan(0)]),
    });
  }

  buildOrificeForm(leak: SteamLeakSurveyData): FormGroup<OrificeFormControls> {
    return this.fb.group<OrificeFormControls>({
      holeSize: new FormControl(leak.orificeMethodData.holeSize, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      dischargeCoefficient: new FormControl(leak.orificeMethodData.dischargeCoefficient, [Validators.required, Validators.min(0), Validators.max(1)]),
      atmosphericPressure: new FormControl(leak.orificeMethodData.atmosphericPressure, [Validators.required, Validators.min(0), Validators.max(20)]),
      steamPressure: new FormControl(leak.orificeMethodData.steamPressure, [Validators.required, Validators.min(115), Validators.max(415)]),
      steamTemperature: new FormControl(leak.orificeMethodData.steamTemperature, [Validators.required, Validators.min(212)]),
      pressureReductionMethod: new FormControl(leak.orificeMethodData.pressureReductionMethod),
      turbineEfficiency: new FormControl(leak.orificeMethodData.turbineEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
    });
  }

  buildPlumeForm(leak: SteamLeakSurveyData): FormGroup<PlumeFormControls> {
    return this.fb.group<PlumeFormControls>({
      steamPressure: new FormControl(leak.plumeMethodData.steamPressure, [Validators.required, Validators.min(115), Validators.max(415)]),
      steamTemperature: new FormControl(leak.plumeMethodData.steamTemperature, [Validators.required, Validators.min(212)]),
      ambientTemperature: new FormControl(leak.plumeMethodData.ambientTemperature, [Validators.required, Validators.min(45), Validators.max(90)]),
      plumeLength: new FormControl(leak.plumeMethodData.plumeLength, [Validators.required, Validators.min(3), Validators.max(12)]),
      pressureReductionMethod: new FormControl(leak.plumeMethodData.pressureReductionMethod),
      turbineEfficiency: new FormControl(leak.plumeMethodData.turbineEfficiency, [Validators.min(0), Validators.max(100)]),
    });
  }

  buildFacilitySteamLeakForm(data: FacilitySteamLeakData): FormGroup<FacilitySteamLeakFormControls> {
    return this.fb.group<FacilitySteamLeakFormControls>({
      annualOperatingHours: new FormControl(data.annualOperatingHours, [Validators.required, Validators.min(0), Validators.max(HOURS_PER_YEAR)]),
      utilityType: new FormControl(data.utilityType),
      steamCost: new FormControl(data.steamCost, [Validators.required, Validators.min(0)]),
      steamTemperature: new FormControl(data.steamTemperature, [Validators.required, Validators.min(212)]),
      steamPressure: new FormControl(data.steamPressure, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      feedwaterTemperature: new FormControl(data.feedwaterTemperature, [Validators.required, Validators.min(32), Validators.max(212)]),
      fuelCost: new FormControl(data.fuelCost, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      fuelEnergyFactor: new FormControl(data.fuelEnergyFactor, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      electricityCost: new FormControl(data.electricityCost, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      boilerEfficiency: new FormControl(data.boilerEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
      systemEfficiency: new FormControl(data.systemEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
    });
  }

  getEstimateDataFromForm(form: FormGroup<EstimateFormControls>): SteamLeakEstimateMethodData {
    return {
      steamPressure: form.controls.steamPressure.value ?? 0,
      steamTemperature: form.controls.steamTemperature.value ?? 0,
      pressureReductionMethod: form.controls.pressureReductionMethod.value ?? 0,
      turbineEfficiency: form.controls.turbineEfficiency.value ?? 0,
      leakRate: form.controls.leakRate.value ?? 0,
    };
  }

  getOrificeDataFromForm(form: FormGroup<OrificeFormControls>): SteamLeakOrificeMethodData {
    return {
      holeSize: form.controls.holeSize.value ?? 0,
      dischargeCoefficient: form.controls.dischargeCoefficient.value ?? 0,
      atmosphericPressure: form.controls.atmosphericPressure.value ?? 0,
      steamPressure: form.controls.steamPressure.value ?? 0,
      steamTemperature: form.controls.steamTemperature.value ?? 0,
      pressureReductionMethod: form.controls.pressureReductionMethod.value ?? 0,
      turbineEfficiency: form.controls.turbineEfficiency.value ?? 0,
    };
  }

  getPlumeDataFromForm(form: FormGroup<PlumeFormControls>): SteamLeakPlumeMethodData {
    return {
      steamPressure: form.controls.steamPressure.value ?? 0,
      steamTemperature: form.controls.steamTemperature.value ?? 0,
      ambientTemperature: form.controls.ambientTemperature.value ?? 0,
      plumeLength: form.controls.plumeLength.value ?? 0,
      pressureReductionMethod: form.controls.pressureReductionMethod.value ?? 0,
      turbineEfficiency: form.controls.turbineEfficiency.value ?? 0, // Plume method does not use turbine efficiency but is needed for API compatibility
    };
  }

  getEmptySteamLeakData(): SteamLeakSurveyData {
    return {
      leakDescription: 'New Leak Description',
      name: 'New Leak',
      selected: true,
      measurementMethod: SteamLeakMeasurementMethod.Estimate,
      estimateMethodData: { steamPressure: 115, steamTemperature: 212, pressureReductionMethod: 0, turbineEfficiency: 0, leakRate: 1 },
      estimateTurbineMethodData: { turbineEfficiency: 0, leakRate: 0 },
      orificeMethodData: { holeSize: 0.25, dischargeCoefficient: 0.61, atmosphericPressure: 14.7, steamPressure: 115, steamTemperature: 212, pressureReductionMethod: 0, turbineEfficiency: 0 },
      plumeMethodData: { steamPressure: 115, steamTemperature: 212, ambientTemperature: 70, plumeLength: 3, pressureReductionMethod: 0, turbineEfficiency: 0 },
      units: 0,
    };
  }
}