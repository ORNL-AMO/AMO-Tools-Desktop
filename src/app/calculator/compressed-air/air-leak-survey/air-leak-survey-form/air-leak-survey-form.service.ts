import { Injectable, inject } from '@angular/core';
import {
  FacilityCompressorData,
  AirLeakSurveyData,
  OrificeMethodData,
  DecibelsMethodData,
  EstimateMethodData,
  BagMethodInput,
} from '../../../../shared/models/standalone';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';
import { Settings } from '../../../../shared/models/settings';
import { ConvertAirLeakService } from '../convert-air-leak.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { LeakMeasurementMethod, CompressorControlType, CompressorSpecificPowerType, FacilityUtilityType } from '../../compressed-air-constants';

const HOURS_PER_YEAR = 8760;


export interface LeakMetaFormControls {
  selected: FormControl<boolean | null>;
  name: FormControl<string | null>;
  leakDescription: FormControl<string | null>;
  measurementMethod: FormControl<number | null>;
  units: FormControl<number | null>;
}

export interface EstimateFormControls {
  leakRateEstimate: FormControl<number | null>;
}

export interface BagFormControls {
  numberOfUnits: FormControl<number | null>;
  bagVolume: FormControl<number | null>;
  bagFillTime: FormControl<number | null>;
}

export interface OrificeFormControls {
  compressorAirTemp: FormControl<number | null>;
  atmosphericPressure: FormControl<number | null>;
  dischargeCoefficient: FormControl<number | null>;
  orificeDiameter: FormControl<number | null>;
  supplyPressure: FormControl<number | null>;
  numberOfOrifices: FormControl<number | null>;
}

export interface DecibelFormControls {
  linePressure: FormControl<number | null>;
  decibels: FormControl<number | null>;
  decibelRatingA: FormControl<number | null>;
  pressureA: FormControl<number | null>;
  firstFlowA: FormControl<number | null>;
  secondFlowA: FormControl<number | null>;
  decibelRatingB: FormControl<number | null>;
  pressureB: FormControl<number | null>;
  firstFlowB: FormControl<number | null>;
  secondFlowB: FormControl<number | null>;
}

export interface CompressorElectricityFormControls {
  compressorControl: FormControl<number | null>;
  compressorControlAdjustment: FormControl<number | null>;
  compressorSpecificPowerControl: FormControl<number | null>;
  compressorSpecificPower: FormControl<number | null>;
}

export interface FacilityCompressorFormControls {
  hoursPerYear: FormControl<number | null>;
  utilityType: FormControl<number | null>;
  utilityCost: FormControl<number | null>;
  compressorElectricityData: FormGroup<CompressorElectricityFormControls>;
}

@Injectable()
export class AirLeakSurveyFormService {
  private readonly fb = inject(FormBuilder);
  private readonly convertAirLeakService = inject(ConvertAirLeakService);

  buildLeakMetaForm(leak: AirLeakSurveyData): FormGroup<LeakMetaFormControls> {
    return this.fb.group<LeakMetaFormControls>({
      selected: new FormControl(leak.selected),
      name: new FormControl(leak.name, [Validators.required]),
      leakDescription: new FormControl(leak.leakDescription, [Validators.required]),
      measurementMethod: new FormControl(leak.measurementMethod),
      units: new FormControl(leak.units),
    });
  }

  buildEstimateForm(leak: AirLeakSurveyData): FormGroup<EstimateFormControls> {
    return this.fb.group<EstimateFormControls>({
      leakRateEstimate: new FormControl(leak.estimateMethodData.leakRateEstimate, [
        Validators.required,
        GreaterThanValidator.greaterThan(0),
      ]),
    });
  }

  buildBagForm(leak: AirLeakSurveyData): FormGroup<BagFormControls> {
    return this.fb.group<BagFormControls>({
      numberOfUnits: new FormControl(leak.bagMethodData.numberOfUnits),
      bagVolume: new FormControl(leak.bagMethodData.bagVolume, [Validators.required, Validators.min(0)]),
      bagFillTime: new FormControl(leak.bagMethodData.bagFillTime, [Validators.required, Validators.min(0)]),
    });
  }

  buildOrificeForm(leak: AirLeakSurveyData): FormGroup<OrificeFormControls> {
    return this.fb.group<OrificeFormControls>({
      compressorAirTemp: new FormControl(leak.orificeMethodData.compressorAirTemp, [Validators.required, Validators.min(0)]),
      atmosphericPressure: new FormControl(leak.orificeMethodData.atmosphericPressure, [Validators.required, Validators.min(0)]),
      dischargeCoefficient: new FormControl(leak.orificeMethodData.dischargeCoefficient, [Validators.required, Validators.min(0)]),
      orificeDiameter: new FormControl(leak.orificeMethodData.orificeDiameter, [Validators.required, Validators.min(0)]),
      supplyPressure: new FormControl(leak.orificeMethodData.supplyPressure, [Validators.required, Validators.min(0)]),
      numberOfOrifices: new FormControl(leak.orificeMethodData.numberOfOrifices, [Validators.required, Validators.min(1)]),
    });
  }

  buildDecibelForm(leak: AirLeakSurveyData): FormGroup<DecibelFormControls> {
    return this.fb.group<DecibelFormControls>({
      linePressure: new FormControl(leak.decibelsMethodData.linePressure, [Validators.required, Validators.min(0)]),
      decibels: new FormControl(leak.decibelsMethodData.decibels, [Validators.required, Validators.min(0)]),
      decibelRatingA: new FormControl(leak.decibelsMethodData.decibelRatingA, [Validators.required, Validators.min(0)]),
      pressureA: new FormControl(leak.decibelsMethodData.pressureA, [Validators.required, Validators.min(0)]),
      firstFlowA: new FormControl(leak.decibelsMethodData.firstFlowA, [Validators.required, Validators.min(0)]),
      secondFlowA: new FormControl(leak.decibelsMethodData.secondFlowA, [Validators.required, Validators.min(0)]),
      decibelRatingB: new FormControl(leak.decibelsMethodData.decibelRatingB, [Validators.required, Validators.min(0)]),
      pressureB: new FormControl(leak.decibelsMethodData.pressureB, [Validators.required, Validators.min(0)]),
      firstFlowB: new FormControl(leak.decibelsMethodData.firstFlowB, [Validators.required, Validators.min(0)]),
      secondFlowB: new FormControl(leak.decibelsMethodData.secondFlowB, [Validators.required, Validators.min(0)]),
    });
  }


  getEstimateDataFromForm(form: FormGroup<EstimateFormControls>): EstimateMethodData {
    return { leakRateEstimate: form.controls.leakRateEstimate.value ?? 0 };
  }

  getBagDataFromForm(form: FormGroup<BagFormControls>, hoursPerYear: number): BagMethodInput {
    return {
      operatingTime: hoursPerYear,
      bagFillTime: form.controls.bagFillTime.value ?? 0,
      bagVolume: form.controls.bagVolume.value ?? 0,
      numberOfUnits: form.controls.numberOfUnits.value ?? 1,
    };
  }

  getOrificeDataFromForm(form: FormGroup<OrificeFormControls>): OrificeMethodData {
    return {
      compressorAirTemp: form.controls.compressorAirTemp.value ?? 0,
      atmosphericPressure: form.controls.atmosphericPressure.value ?? 0,
      dischargeCoefficient: form.controls.dischargeCoefficient.value ?? 0,
      orificeDiameter: form.controls.orificeDiameter.value ?? 0,
      supplyPressure: form.controls.supplyPressure.value ?? 0,
      numberOfOrifices: form.controls.numberOfOrifices.value ?? 1,
    };
  }

  getDecibelDataFromForm(form: FormGroup<DecibelFormControls>): DecibelsMethodData {
    return {
      linePressure: form.controls.linePressure.value ?? 0,
      decibels: form.controls.decibels.value ?? 0,
      decibelRatingA: form.controls.decibelRatingA.value ?? 0,
      pressureA: form.controls.pressureA.value ?? 0,
      firstFlowA: form.controls.firstFlowA.value ?? 0,
      secondFlowA: form.controls.secondFlowA.value ?? 0,
      decibelRatingB: form.controls.decibelRatingB.value ?? 0,
      pressureB: form.controls.pressureB.value ?? 0,
      firstFlowB: form.controls.firstFlowB.value ?? 0,
      secondFlowB: form.controls.secondFlowB.value ?? 0,
    };
  }


  buildFacilityCompressorForm(data: FacilityCompressorData): FormGroup<FacilityCompressorFormControls> {
    const form = this.fb.group<FacilityCompressorFormControls>({
      hoursPerYear: new FormControl(data.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(HOURS_PER_YEAR)]),
      utilityType: new FormControl(data.utilityType),
      utilityCost: new FormControl(data.utilityCost, [Validators.required, Validators.min(0)]),
      compressorElectricityData: this.fb.group<CompressorElectricityFormControls>({
        compressorControl: new FormControl(data.compressorElectricityData.compressorControl),
        compressorControlAdjustment: new FormControl(data.compressorElectricityData.compressorControlAdjustment),
        compressorSpecificPowerControl: new FormControl(data.compressorElectricityData.compressorSpecificPowerControl),
        compressorSpecificPower: new FormControl(data.compressorElectricityData.compressorSpecificPower),
      }),
    });
    return this.applyCompressorValidators(form);
  }

  applyCompressorValidators(form: FormGroup<FacilityCompressorFormControls>): FormGroup<FacilityCompressorFormControls> {
    const elec = form.controls.compressorElectricityData;
    if (form.controls.utilityType.value === FacilityUtilityType.Electric) {
      elec.controls.compressorControl.setValidators([Validators.required]);
      elec.controls.compressorControl.updateValueAndValidity();
      if (elec.controls.compressorControl.value === CompressorControlType.Custom) {
        elec.controls.compressorControlAdjustment.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        elec.controls.compressorControlAdjustment.updateValueAndValidity();
      }
      if (elec.controls.compressorSpecificPowerControl.value === CompressorSpecificPowerType.Custom) {
        elec.controls.compressorSpecificPower.setValidators([Validators.required, Validators.min(0)]);
        elec.controls.compressorSpecificPower.updateValueAndValidity();
      }
    }
    return form;
  }


  getEmptyAirLeakData(): AirLeakSurveyData {
    return {
      leakDescription: 'New leak description',
      name: 'New Leak',
      selected: true,
      measurementMethod: LeakMeasurementMethod.Estimate,
      estimateMethodData: { leakRateEstimate: 0.1 },
      bagMethodData: { operatingTime: 0, bagVolume: 0, bagFillTime: 0, numberOfUnits: 1 },
      decibelsMethodData: {
        linePressure: 0, decibels: 0, decibelRatingA: 0, pressureA: 0,
        firstFlowA: 0, secondFlowA: 0, decibelRatingB: 0, pressureB: 0,
        firstFlowB: 0, secondFlowB: 0,
      },
      orificeMethodData: {
        compressorAirTemp: 0, atmosphericPressure: 0, dischargeCoefficient: 0,
        orificeDiameter: 0, supplyPressure: 0, numberOfOrifices: 1,
      },
      units: 1,
    };
  }

  getEmptyFacilityCompressorData(settings: Settings, operatingHours?: OperatingHours): FacilityCompressorData {
    let data: FacilityCompressorData = {
      hoursPerYear: operatingHours?.hoursPerYear ?? HOURS_PER_YEAR,
      utilityType: 1,
      utilityCost: settings?.electricityCost ?? 0.066,
      compressorElectricityData: {
        compressorControl: 8,
        compressorControlAdjustment: 25,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16,
      },
    };
    if (settings?.unitsOfMeasure === 'Metric') {
      data = this.convertAirLeakService.convertImperialFacilityCompressorData(data);
    }
    return data;
  }

  getExampleFacilityCompressorData(): FacilityCompressorData {
    return {
      hoursPerYear: HOURS_PER_YEAR,
      utilityType: 1,
      utilityCost: 0.066,
      compressorElectricityData: {
        compressorControl: 8,
        compressorControlAdjustment: 25,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16,
      },
    };
  }
}
