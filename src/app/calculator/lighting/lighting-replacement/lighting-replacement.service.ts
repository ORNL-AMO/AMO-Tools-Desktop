import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LightingReplacementResults, LightingReplacementData, LightingReplacementResult } from '../../../shared/models/lighting';
import { LightingReplacementTreasureHunt } from '../../../shared/models/treasure-hunt';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class LightingReplacementService {

  baselineData: Array<LightingReplacementData>;
  modificationData: Array<LightingReplacementData>;
  baselineElectricityCost: number;
  modificationElectricityCost: number;
  constructor(private fb: FormBuilder) { }

  resetData(settings: Settings) {
    this.baselineData = new Array<LightingReplacementData>();
    this.modificationData = new Array<LightingReplacementData>();
    this.baselineData.push(this.initObject(0));
  }

  initObject(index: number): LightingReplacementData {
    return {
      name: 'Fixture #' + (index + 1),
      hoursPerYear: 8736,
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

  addBaselineFixture(index: number): void {
    if (this.baselineData === null || this.baselineData === undefined) {
      this.baselineData = new Array<LightingReplacementData>();
    }
    this.baselineData.push(this.initObject(index));
  }

  removeBaselineFixture(index: number): void {
    this.baselineData.splice(index, 1);
  }

  initModificationData(): void {
    if (this.modificationData === undefined || this.modificationData === null) {
      this.modificationData = new Array<LightingReplacementData>();
    }
  }

  createModification(): void {
    this.modificationData = new Array<LightingReplacementData>();
    for (let i = 0; i < this.baselineData.length; i++) {
      this.modificationData.push(this.baselineData[i]);
    }
  }

  addModificationFixture(index: number): void {
    if (this.modificationData === null || this.modificationData === undefined) {
      this.modificationData = new Array<LightingReplacementData>();
    }
    this.modificationData.push(this.initObject(index));
  }

  removeModificationFixture(index: number): void {
    this.modificationData.splice(index, 1);
  }

  updateBaselineDataArray(baselineForms: Array<FormGroup>): void {
    for (let i = 0; i < this.baselineData.length; i++) {
      this.baselineData[i] = this.getObjFromForm(baselineForms[i]);
      this.baselineData[i] = this.calculateElectricityUse(this.baselineData[i]);
      this.baselineData[i] = this.calculateTotalLighting(this.baselineData[i]);
    }
  }

  updateModificationDataArray(modificationForms: Array<FormGroup>): void {
    if (this.modificationData !== undefined && this.modificationData !== null) {
      for (let i = 0; i < this.modificationData.length; i++) {
        this.modificationData[i] = this.getObjFromForm(modificationForms[i]);
        this.modificationData[i] = this.calculateElectricityUse(this.modificationData[i]);
        this.modificationData[i] = this.calculateTotalLighting(this.modificationData[i]);
      }
    }
  }

  calculate(isBaseline: boolean, index: number): void {
    let data = isBaseline ? this.baselineData[index] : this.modificationData[index];
    data = this.calculateElectricityUse(data);
    data = this.calculateTotalLighting(data);
    isBaseline ? this.baselineData[index] = data : this.modificationData[index] = data;
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

  calculateResults(): LightingReplacementResults {
    let baselineResults: LightingReplacementResult = this.getTotals(this.baselineData, this.baselineElectricityCost);
    let modificationResults: LightingReplacementResult = this.getTotals(this.modificationData, this.modificationElectricityCost);
    let totalEnergySavings: number = baselineResults.totalElectricityUse - modificationResults.totalElectricityUse;
    let totalCostSavings: number = baselineResults.totalOperatingCosts - modificationResults.totalOperatingCosts;
    return {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      totalEnergySavings: totalEnergySavings,
      totalCostSavings: totalCostSavings
    }
  }

  getResults(lightingData: LightingReplacementTreasureHunt): LightingReplacementResults {
    let baselineResults: LightingReplacementResult = this.getTotals(lightingData.baseline, lightingData.baselineElectricityCost);
    let modificationResults: LightingReplacementResult = this.getTotals(lightingData.modifications, lightingData.modificationElectricityCost);
    let totalEnergySavings: number = baselineResults.totalElectricityUse - modificationResults.totalElectricityUse;
    let totalCostSavings: number = baselineResults.totalOperatingCosts - modificationResults.totalOperatingCosts;
    return {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      totalEnergySavings: totalEnergySavings,
      totalCostSavings: totalCostSavings
    }
  }

  getInitializedData(): Array<LightingReplacementData> {
    let data: LightingReplacementData = this.initObject(0);
    return [data]
  }
}

