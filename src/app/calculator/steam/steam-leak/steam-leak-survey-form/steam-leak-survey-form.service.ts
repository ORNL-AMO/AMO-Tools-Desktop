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
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { roundVal } from '../../../../shared/helperFunctions';
import { ConvertSteamLeakService } from '../convert-steam-leak.service';

const HOURS_PER_YEAR = 8760;

const boilingPointOfWaterF = 212;           // °F — minimum valid steam temperature; also feedwater upper bound
const freezingPointOfWaterF = 32;           // °F — minimum valid feedwater temperature
const steamSystemPressureMinPsig = 115;     // psig — lower operational pressure bound for steam leak survey
const steamSystemPressureMaxPsig = 415;     // psig — upper operational pressure bound for steam leak survey
const atmosphericPressureMaxPsia = 20;      // psia — reasonable upper limit for atmospheric pressure input
const ambientTemperatureMinF = 45;          // °F — minimum practical ambient temperature for plume measurement
const ambientTemperatureMaxF = 90;          // °F — maximum practical ambient temperature for plume measurement
const plumeLengthMinFt = 3;                 // ft — minimum visible plume length for accurate measurement
const plumeLengthMaxFt = 12;               // ft — maximum plume length for accurate measurement
const plumeSteamTemperatureMaxF = 482;      // °F (250 °C) — upper steam temperature limit for plume method accuracy

export interface LeakMetaFormControls {
  selected: FormControl<boolean | null>;
  name: FormControl<string | null>;
  leakDescription: FormControl<string | null>;
  measurementMethod: FormControl<number | null>;
  units: FormControl<number | null>;
}

export interface EstimateFormControls {
  leakPressure: FormControl<number | null>;
  leakTemperature: FormControl<number | null>;
  pressureReductionMethod: FormControl<number | null>;
  turbineEfficiency: FormControl<number | null>;
  leakRate: FormControl<number | null>;
}

export interface OrificeFormControls {
  holeSize: FormControl<number | null>;
  dischargeCoefficient: FormControl<number | null>;
  atmosphericPressure: FormControl<number | null>;
  leakPressure: FormControl<number | null>;
  leakTemperature: FormControl<number | null>;
  pressureReductionMethod: FormControl<number | null>;
  turbineEfficiency: FormControl<number | null>;
}

export interface PlumeFormControls {
  leakPressure: FormControl<number | null>;
  leakTemperature: FormControl<number | null>;
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
  private readonly convertUnitsService = inject(ConvertUnitsService);

  private getTemperatureLimits(settings?: Settings) {
    if (settings?.unitsOfMeasure !== 'Metric') {
      return {
        steamTempMin: boilingPointOfWaterF,
        plumeSteamTempMax: plumeSteamTemperatureMaxF,
        ambientTempMin: ambientTemperatureMinF,
        ambientTempMax: ambientTemperatureMaxF,
        feedwaterTempMin: freezingPointOfWaterF,
        feedwaterTempMax: boilingPointOfWaterF,
      };
    }
    return {
      steamTempMin: roundVal(this.convertUnitsService.value(boilingPointOfWaterF).from('F').to('C'), 1),
      plumeSteamTempMax: roundVal(this.convertUnitsService.value(plumeSteamTemperatureMaxF).from('F').to('C'), 1),
      ambientTempMin: roundVal(this.convertUnitsService.value(ambientTemperatureMinF).from('F').to('C'), 1),
      ambientTempMax: roundVal(this.convertUnitsService.value(ambientTemperatureMaxF).from('F').to('C'), 1),
      feedwaterTempMin: roundVal(this.convertUnitsService.value(freezingPointOfWaterF).from('F').to('C'), 1),
      feedwaterTempMax: roundVal(this.convertUnitsService.value(boilingPointOfWaterF).from('F').to('C'), 1),
    };
  }

  private getPressureLimits(settings?: Settings) {
    if (settings?.unitsOfMeasure !== 'Metric') {
      return {
        steamPressureMin: steamSystemPressureMinPsig,
        steamPressureMax: steamSystemPressureMaxPsig,
        atmosphericPressureMax: atmosphericPressureMaxPsia,
      };
    }
    return {
      steamPressureMin: roundVal(this.convertUnitsService.value(steamSystemPressureMinPsig).from('psig').to('kPag'), 0),
      steamPressureMax: roundVal(this.convertUnitsService.value(steamSystemPressureMaxPsig).from('psig').to('kPag'), 0),
      atmosphericPressureMax: roundVal(this.convertUnitsService.value(atmosphericPressureMaxPsia).from('psia').to('kPaa'), 1),
    };
  }

  private getPlumeLengthLimits(settings?: Settings) {
    if (settings?.unitsOfMeasure !== 'Metric') {
      return { min: plumeLengthMinFt, max: plumeLengthMaxFt };
    }
    return {
      min: roundVal(this.convertUnitsService.value(plumeLengthMinFt).from('ft').to('m'), 2),
      max: roundVal(this.convertUnitsService.value(plumeLengthMaxFt).from('ft').to('m'), 2),
    };
  }
  private readonly convertSteamLeakService = inject(ConvertSteamLeakService);

  buildLeakMetaForm(leak: SteamLeakSurveyData): FormGroup<LeakMetaFormControls> {
    return this.fb.group<LeakMetaFormControls>({
      selected: new FormControl(leak.selected),
      name: new FormControl(leak.name, [Validators.required]),
      leakDescription: new FormControl(leak.leakDescription, [Validators.required]),
      measurementMethod: new FormControl(leak.measurementMethod),
      units: new FormControl(leak.units),
    });
  }

  buildEstimateForm(leak: SteamLeakSurveyData, settings?: Settings, maxSteamTemp?: number): FormGroup<EstimateFormControls> {
    const { steamPressureMin, steamPressureMax } = this.getPressureLimits(settings);
    const { steamTempMin } = this.getTemperatureLimits(settings);
    const steamTempValidators = maxSteamTemp !== undefined
      ? [Validators.required, Validators.min(steamTempMin), Validators.max(maxSteamTemp)]
      : [Validators.required, Validators.min(steamTempMin)];
    return this.fb.group<EstimateFormControls>({
      leakPressure: new FormControl(leak.estimateMethodData.leakPressure, [Validators.required, Validators.min(steamPressureMin), Validators.max(steamPressureMax)]),
      leakTemperature: new FormControl(leak.estimateMethodData.leakTemperature, steamTempValidators),
      pressureReductionMethod: new FormControl(leak.estimateMethodData.pressureReductionMethod),
      turbineEfficiency: new FormControl(leak.estimateMethodData.turbineEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
      leakRate: new FormControl(leak.estimateMethodData.leakRate, [Validators.required, GreaterThanValidator.greaterThan(0)]),
    });
  }

  buildOrificeForm(leak: SteamLeakSurveyData, settings?: Settings, maxSteamTemp?: number): FormGroup<OrificeFormControls> {
    const { steamPressureMin, steamPressureMax, atmosphericPressureMax } = this.getPressureLimits(settings);
    const { steamTempMin } = this.getTemperatureLimits(settings);
    const steamTempValidators = maxSteamTemp !== undefined
      ? [Validators.required, Validators.min(steamTempMin), Validators.max(maxSteamTemp)]
      : [Validators.required, Validators.min(steamTempMin)];
    return this.fb.group<OrificeFormControls>({
      holeSize: new FormControl(leak.orificeMethodData.holeSize, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      dischargeCoefficient: new FormControl(leak.orificeMethodData.dischargeCoefficient, [Validators.required, Validators.min(0), Validators.max(1)]),
      atmosphericPressure: new FormControl(leak.orificeMethodData.atmosphericPressure, [Validators.required, Validators.min(0), Validators.max(atmosphericPressureMax)]),
      leakPressure: new FormControl(leak.orificeMethodData.leakPressure, [Validators.required, Validators.min(steamPressureMin), Validators.max(steamPressureMax)]),
      leakTemperature: new FormControl(leak.orificeMethodData.leakTemperature, steamTempValidators),
      pressureReductionMethod: new FormControl(leak.orificeMethodData.pressureReductionMethod),
      turbineEfficiency: new FormControl(leak.orificeMethodData.turbineEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
    });
  }

  buildPlumeForm(leak: SteamLeakSurveyData, settings?: Settings, maxSteamTemp?: number): FormGroup<PlumeFormControls> {
    const { steamPressureMin, steamPressureMax } = this.getPressureLimits(settings);
    const { steamTempMin, ambientTempMin, ambientTempMax } = this.getTemperatureLimits(settings);
    const { min: plumeLengthMin, max: plumeLengthMax } = this.getPlumeLengthLimits(settings);
    const steamTempValidators = maxSteamTemp !== undefined
      ? [Validators.required, Validators.min(steamTempMin), Validators.max(maxSteamTemp)]
      : [Validators.required, Validators.min(steamTempMin)];
    return this.fb.group<PlumeFormControls>({
      leakPressure: new FormControl(leak.plumeMethodData.leakPressure, [Validators.required, Validators.min(steamPressureMin), Validators.max(steamPressureMax)]),
      leakTemperature: new FormControl(leak.plumeMethodData.leakTemperature, steamTempValidators),
      ambientTemperature: new FormControl(leak.plumeMethodData.ambientTemperature, [Validators.required, Validators.min(ambientTempMin), Validators.max(ambientTempMax)]),
      plumeLength: new FormControl(leak.plumeMethodData.plumeLength, [Validators.required, Validators.min(plumeLengthMin), Validators.max(plumeLengthMax)]),
      pressureReductionMethod: new FormControl(leak.plumeMethodData.pressureReductionMethod),
      turbineEfficiency: new FormControl(leak.plumeMethodData.turbineEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
    });
  }

  buildFacilitySteamLeakForm(data: FacilitySteamLeakData, settings?: Settings): FormGroup<FacilitySteamLeakFormControls> {
    const tempLimits = this.getTemperatureLimits(settings);
    return this.fb.group<FacilitySteamLeakFormControls>({
      annualOperatingHours: new FormControl(data.annualOperatingHours, [Validators.required, Validators.min(0), Validators.max(HOURS_PER_YEAR)]),
      utilityType: new FormControl(data.utilityType),
      steamCost: new FormControl(data.steamCost, [Validators.required, Validators.min(0)]),
      steamTemperature: new FormControl(data.steamTemperature, [Validators.required, Validators.min(tempLimits.steamTempMin)]),
      steamPressure: new FormControl(data.steamPressure, [Validators.required, Validators.min(0)]),
      feedwaterTemperature: new FormControl(data.feedwaterTemperature, [Validators.required, Validators.min(tempLimits.feedwaterTempMin), Validators.max(tempLimits.feedwaterTempMax)]),
      fuelCost: new FormControl(data.fuelCost, [Validators.required, Validators.min(0)]),
      fuelEnergyFactor: new FormControl(data.fuelEnergyFactor, [Validators.required, Validators.min(0)]),
      electricityCost: new FormControl(data.electricityCost, [Validators.required, Validators.min(0)]),
      boilerEfficiency: new FormControl(data.boilerEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
      systemEfficiency: new FormControl(data.systemEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
    });
  }

  getEstimateDataFromForm(form: FormGroup<EstimateFormControls>): SteamLeakEstimateMethodData {
    return {
      leakPressure: form.controls.leakPressure.value ?? 0,
      leakTemperature: form.controls.leakTemperature.value ?? 0,
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
      leakPressure: form.controls.leakPressure.value ?? 0,
      leakTemperature: form.controls.leakTemperature.value ?? 0,
      pressureReductionMethod: form.controls.pressureReductionMethod.value ?? 0,
      turbineEfficiency: form.controls.turbineEfficiency.value ?? 0,
    };
  }

  getPlumeDataFromForm(form: FormGroup<PlumeFormControls>): SteamLeakPlumeMethodData {
    return {
      leakPressure: form.controls.leakPressure.value ?? 0,
      leakTemperature: form.controls.leakTemperature.value ?? 0,
      ambientTemperature: form.controls.ambientTemperature.value ?? 0,
      plumeLength: form.controls.plumeLength.value ?? 0,
      pressureReductionMethod: form.controls.pressureReductionMethod.value ?? 0,
      turbineEfficiency: form.controls.turbineEfficiency.value ?? 0,
    };
  }

  getEmptySteamLeakData(settings?: Settings): SteamLeakSurveyData {
    let data: SteamLeakSurveyData = {
      leakDescription: 'New Leak Description',
      name: 'New Leak',
      selected: true,
      measurementMethod: SteamLeakMeasurementMethod.Estimate,
      estimateMethodData: { leakPressure: 115, leakTemperature: 212, pressureReductionMethod: 0, turbineEfficiency: 0, leakRate: 1 },
      estimateTurbineMethodData: { turbineEfficiency: 0, leakRate: 0 },
      orificeMethodData: { holeSize: 0.25, dischargeCoefficient: 0.61, atmosphericPressure: 14.7, leakPressure: 115, leakTemperature: 212, pressureReductionMethod: 0, turbineEfficiency: 0 },
      plumeMethodData: { leakPressure: 115, leakTemperature: 212, ambientTemperature: 70, plumeLength: 3, pressureReductionMethod: 0, turbineEfficiency: 0 },
      units: 0,
    };
    if (settings?.unitsOfMeasure === 'Metric') {
      data = this.convertSteamLeakService.convertInputDataImperialToMetric(data);
    }
    return data;
  }
}