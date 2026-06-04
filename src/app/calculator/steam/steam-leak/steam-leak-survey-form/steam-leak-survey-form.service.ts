import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';
import {
  FacilitySteamLeakData,
  SteamLeakEstimateMethodData,
  SteamLeakEstimateTurbineMethodData,
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
  leakRate: FormControl<number | null>;
}

export interface EstimateTurbineFormControls {
  turbineEfficiency: FormControl<number | null>;
  leakRate: FormControl<number | null>;
}

export interface OrificeFormControls {
  turbineEfficiency: FormControl<number | null>;
  holeSize: FormControl<number | null>;
  dischargeCoefficient: FormControl<number | null>;
  atmosphericPressure: FormControl<number | null>;
}

export interface PlumeFormControls {
  turbineEfficiency: FormControl<number | null>;
  plumeLength: FormControl<number | null>;
  ambientTemperature: FormControl<number | null>;
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
      leakRate: new FormControl(leak.estimateMethodData.leakRate, [Validators.required, Validators.min(0)]),
    });
  }

  buildEstimateTurbineForm(leak: SteamLeakSurveyData): FormGroup<EstimateTurbineFormControls> {
    return this.fb.group<EstimateTurbineFormControls>({
      turbineEfficiency: new FormControl(leak.estimateTurbineMethodData.turbineEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
      leakRate: new FormControl(leak.estimateTurbineMethodData.leakRate, [Validators.required, Validators.min(0)]),
    });
  }

  buildOrificeForm(leak: SteamLeakSurveyData): FormGroup<OrificeFormControls> {
    return this.fb.group<OrificeFormControls>({
      turbineEfficiency: new FormControl(leak.orificeMethodData.turbineEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
      holeSize: new FormControl(leak.orificeMethodData.holeSize, [Validators.required, Validators.min(0)]),
      dischargeCoefficient: new FormControl(leak.orificeMethodData.dischargeCoefficient, [Validators.required, Validators.min(0)]),
      atmosphericPressure: new FormControl(leak.orificeMethodData.atmosphericPressure, [Validators.required, Validators.min(0)]),
    });
  }

  buildPlumeForm(leak: SteamLeakSurveyData): FormGroup<PlumeFormControls> {
    return this.fb.group<PlumeFormControls>({
      turbineEfficiency: new FormControl(leak.plumeMethodData.turbineEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
      plumeLength: new FormControl(leak.plumeMethodData.plumeLength, [Validators.required, Validators.min(0)]),
      ambientTemperature: new FormControl(leak.plumeMethodData.ambientTemperature, [Validators.required]),
    });
  }

  buildFacilitySteamLeakForm(data: FacilitySteamLeakData): FormGroup<FacilitySteamLeakFormControls> {
    return this.fb.group<FacilitySteamLeakFormControls>({
      annualOperatingHours: new FormControl(data.annualOperatingHours, [Validators.required, Validators.min(0), Validators.max(HOURS_PER_YEAR)]),
      utilityType: new FormControl(data.utilityType),
      steamCost: new FormControl(data.steamCost, [Validators.required, Validators.min(0)]),
      steamTemperature: new FormControl(data.steamTemperature, [Validators.required]),
      steamPressure: new FormControl(data.steamPressure, [Validators.required, Validators.min(0)]),
      feedwaterTemperature: new FormControl(data.feedwaterTemperature, [Validators.required]),
      fuelCost: new FormControl(data.fuelCost, [Validators.required, Validators.min(0)]),
      fuelEnergyFactor: new FormControl(data.fuelEnergyFactor, [Validators.required, Validators.min(0)]),
      electricityCost: new FormControl(data.electricityCost, [Validators.required, Validators.min(0)]),
      boilerEfficiency: new FormControl(data.boilerEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
      systemEfficiency: new FormControl(data.systemEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
    });
  }

  getEstimateDataFromForm(form: FormGroup<EstimateFormControls>): SteamLeakEstimateMethodData {
    return { leakRate: form.controls.leakRate.value ?? 0 };
  }

  getEstimateTurbineDataFromForm(form: FormGroup<EstimateTurbineFormControls>): SteamLeakEstimateTurbineMethodData {
    return {
      turbineEfficiency: form.controls.turbineEfficiency.value ?? 0,
      leakRate: form.controls.leakRate.value ?? 0,
    };
  }

  getOrificeDataFromForm(form: FormGroup<OrificeFormControls>): SteamLeakOrificeMethodData {
    return {
      turbineEfficiency: form.controls.turbineEfficiency.value ?? 0,
      holeSize: form.controls.holeSize.value ?? 0,
      dischargeCoefficient: form.controls.dischargeCoefficient.value ?? 0,
      atmosphericPressure: form.controls.atmosphericPressure.value ?? 0,
    };
  }

  getPlumeDataFromForm(form: FormGroup<PlumeFormControls>): SteamLeakPlumeMethodData {
    return {
      turbineEfficiency: form.controls.turbineEfficiency.value ?? 0,
      plumeLength: form.controls.plumeLength.value ?? 0,
      ambientTemperature: form.controls.ambientTemperature.value ?? 0,
    };
  }

  getEmptySteamLeakData(): SteamLeakSurveyData {
    return {
      leakDescription: 'New Leak Description',
      name: 'New Leak',
      selected: true,
      measurementMethod: SteamLeakMeasurementMethod.Estimate,
      estimateMethodData: { leakRate: 0 },
      estimateTurbineMethodData: { turbineEfficiency: 0, leakRate: 0 },
      orificeMethodData: { turbineEfficiency: 0, holeSize: 0, dischargeCoefficient: 0.61, atmosphericPressure: 14.7 },
      plumeMethodData: { turbineEfficiency: 0, plumeLength: 0, ambientTemperature: 0 },
      units: 0,
    };
  }
}