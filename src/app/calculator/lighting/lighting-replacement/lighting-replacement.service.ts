import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LightingReplacementResults, LightingReplacementData, LightingReplacementResult } from '../../../shared/models/lighting';
import { LightingReplacementTreasureHunt } from '../../../shared/models/treasure-hunt';
import { OperatingHours } from '../../../shared/models/operations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class LightingReplacementService {

  baselineData: Array<LightingReplacementData>;
  modificationData: Array<LightingReplacementData>;
  baselineElectricityCost: number;
  modificationElectricityCost: number;
  operatingHours: OperatingHours;
  constructor(private fb: FormBuilder) { }

  initObject(index: number, opperatingHoursPerYear: OperatingHours): LightingReplacementData {
    let hoursPerYear: number = 8760;
    if (opperatingHoursPerYear) {
      hoursPerYear = opperatingHoursPerYear.hoursPerYear;
    }
    return {
      name: 'Fixture #' + (index + 1),
      hoursPerYear: hoursPerYear,
      wattsPerLamp: 0,
      lampsPerFixture: 0,
      numberOfFixtures: 0,
      lumensPerLamp: 0,
      totalLighting: 0,
      electricityUse: 0
    }
  }

  getFormFromObj(obj: LightingReplacementData): FormGroup {
    let form: FormGroup = this.fb.group({
      name: [obj.name, Validators.required],
      hoursPerYear: [obj.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      wattsPerLamp: [obj.wattsPerLamp, [Validators.required, Validators.min(0)]],
      lampsPerFixture: [obj.lampsPerFixture, [Validators.required, Validators.min(0)]],
      numberOfFixtures: [obj.numberOfFixtures, [Validators.required, Validators.min(0)]],
      lumensPerLamp: [obj.lumensPerLamp, [Validators.required, Validators.min(0)]],
    });
    return form;
  }

  getObjFromForm(form: FormGroup): LightingReplacementData {
    let tmpData: LightingReplacementData = {
      name: form.controls.name.value,
      hoursPerYear: form.controls.hoursPerYear.value,
      wattsPerLamp: form.controls.wattsPerLamp.value,
      lampsPerFixture: form.controls.lampsPerFixture.value,
      numberOfFixtures: form.controls.numberOfFixtures.value,
      lumensPerLamp: form.controls.lumensPerLamp.value,
      totalLighting: 0,
      electricityUse: 0
    };
    tmpData = this.calculateElectricityUse(tmpData);
    tmpData = this.calculateTotalLighting(tmpData);
    return tmpData;
  }

  calculateElectricityUse(data: LightingReplacementData): LightingReplacementData {
    data.electricityUse = data.wattsPerLamp * data.lampsPerFixture * data.numberOfFixtures * (1 / 1000) * data.hoursPerYear;
    return data;
  }

  calculateTotalLighting(data: LightingReplacementData): LightingReplacementData {
    data.totalLighting = data.lumensPerLamp * data.lampsPerFixture * data.numberOfFixtures;
    return data;
  }

  getTotals(data: Array<LightingReplacementData>, cost: number): LightingReplacementResult {
    let totalElectricityUse: number = _.sumBy(data, 'electricityUse');
    let totalLighting: number = _.sumBy(data, 'totalLighting');
    let totalOperatingHours: number = _.sumBy(data, 'hoursPerYear');
    let totalOperatingCosts: number = totalElectricityUse * cost;

    let tmpResults: LightingReplacementResult = {
      totalElectricityUse: totalElectricityUse,
      totalLighting: totalLighting,
      totalOperatingHours: totalOperatingHours,
      totalOperatingCosts: totalOperatingCosts
    }
    return tmpResults;
  }

  getResults(lightingData: LightingReplacementTreasureHunt): LightingReplacementResults {
    let baselineResults: LightingReplacementResult = this.getTotals(lightingData.baseline, lightingData.baselineElectricityCost);
    let modificationResults: LightingReplacementResult = {
      totalElectricityUse: 0,
      totalLighting: 0,
      totalOperatingHours: 0,
      totalOperatingCosts: 0
    }
    if (lightingData.modifications) {
      modificationResults = this.getTotals(lightingData.modifications, lightingData.modificationElectricityCost);
    }
    let totalEnergySavings: number = baselineResults.totalElectricityUse - modificationResults.totalElectricityUse;
    let totalCostSavings: number = baselineResults.totalOperatingCosts - modificationResults.totalOperatingCosts;
    return {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      totalEnergySavings: totalEnergySavings,
      totalCostSavings: totalCostSavings
    }
  }
}

