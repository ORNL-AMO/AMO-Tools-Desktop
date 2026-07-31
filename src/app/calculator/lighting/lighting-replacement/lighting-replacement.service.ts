import { Injectable, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { LightingReplacementResults, LightingReplacementData, LightingReplacementResult } from '../../../shared/models/lighting';
import { LightingReplacementTreasureHunt } from '../../../shared/models/treasure-hunt';
import { OperatingHours } from '../../../shared/models/operations';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { LightingFixtureCategory, LightingFixtureData, LightingSuiteApiService } from '../../../tools-suite-api/lighting-suite-api.service';
import { LightingFixtureServiceDbService } from '../../../indexedDb/lighting-fixture-db.service';
import { LightingFixtureMaterial } from '../../../shared/models/materials';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
@Injectable()
export class LightingReplacementService implements OnDestroy {

  baselineData: Array<LightingReplacementData>;
  modificationData: Array<LightingReplacementData>;
  baselineElectricityCost: number;
  modificationElectricityCost: number;
  operatingHours: OperatingHours;
  selectedFixtureTypes: BehaviorSubject<Array<LightingFixtureData>>;
  showAdditionalDetails: boolean = false;

  lightingFixtureCategories: Array<LightingFixtureCategory>;

  customFixturesUpdated: Subject<void> = new Subject<void>();
  private customFixturesSub: Subscription;
  private latestCustomMaterials: Array<LightingFixtureMaterial>;

  constructor(private fb: UntypedFormBuilder, private lightingSuiteApiService: LightingSuiteApiService,
    private lightingFixtureServiceDbService: LightingFixtureServiceDbService) {
    this.selectedFixtureTypes = new BehaviorSubject(undefined);
    this.customFixturesSub = this.lightingFixtureServiceDbService.dbLightingFixtureMaterials.subscribe(materials => {
      this.latestCustomMaterials = materials;
      if (this.lightingFixtureCategories) {
        this.applyCustomFixtures(materials);
      }
    });
  }

  ngOnDestroy() {
    this.customFixturesSub?.unsubscribe();
  }

  getLightingFixtureCategories(): Array<LightingFixtureCategory> {
    if (!this.lightingFixtureCategories) {
      this.lightingFixtureCategories = this.lightingSuiteApiService.getLightingSystems();
      if (this.latestCustomMaterials) {
        this.applyCustomFixtures(this.latestCustomMaterials);
      }
    }
    return this.lightingFixtureCategories;
  }

  applyCustomFixtures(materials: Array<LightingFixtureMaterial>) {
    let customCategory: LightingFixtureCategory = this.lightingFixtureCategories.find(fixtureCategory => fixtureCategory.category === 0);
    customCategory.fixturesData = materials.filter(material => !material.isDefault).map(material => this.toLightingFixtureData(material));
    this.customFixturesUpdated.next();
  }

  toLightingFixtureData(material: LightingFixtureMaterial): LightingFixtureData {
    return {
      category: material.category,
      type: material.type && material.type.trim() !== '' ? material.type : material.name,
      lampsPerFixture: material.lampsPerFixture,
      wattsPerLamp: material.wattsPerLamp,
      lumensPerLamp: material.lumensPerLamp,
      lampLife: material.lampLife,
      coefficientOfUtilization: material.coefficientOfUtilization,
      ballastFactor: material.ballastFactor,
      lumenDegradationFactor: material.lumenDegradationFactor
    };
  }

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
      lumensPerLamp: 1,
      totalLighting: 0,
      electricityUse: 0,
      //added for #2381
      lampLife: 0,
      ballastFactor: 0,
      lumenDegradationFactor: 1,
      coefficientOfUtilization: 1,
      category: 0,
      type: 'Custom'
    }
  }

  getFormFromObj(obj: LightingReplacementData): UntypedFormGroup {
    let form: UntypedFormGroup = this.fb.group({
      name: [obj.name, Validators.required],
      hoursPerYear: [obj.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      wattsPerLamp: [obj.wattsPerLamp, [Validators.required, Validators.min(0)]],
      lampsPerFixture: [obj.lampsPerFixture, [Validators.required, Validators.min(0)]],
      numberOfFixtures: [obj.numberOfFixtures, [Validators.required, Validators.min(0)]],
      lumensPerLamp: [obj.lumensPerLamp, [Validators.required, Validators.min(0)]],
      //added for #2381
      lampLife: [obj.lampLife],
      ballastFactor: [obj.ballastFactor, [Validators.required, Validators.min(.5), Validators.max(1.5)]],
      lumenDegradationFactor: [obj.lumenDegradationFactor, [Validators.required, Validators.min(.5), Validators.max(1)]],
      coefficientOfUtilization: [obj.coefficientOfUtilization, [Validators.required, Validators.min(.1), Validators.max(1)]],
      category: [obj.category],
      type: [obj.type]
    });
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): LightingReplacementData {
    let tmpData: LightingReplacementData = {
      name: form.controls.name.value,
      hoursPerYear: form.controls.hoursPerYear.value,
      wattsPerLamp: form.controls.wattsPerLamp.value,
      lampsPerFixture: form.controls.lampsPerFixture.value,
      numberOfFixtures: form.controls.numberOfFixtures.value,
      lumensPerLamp: form.controls.lumensPerLamp.value,
      totalLighting: 0,
      electricityUse: 0,
      //added for #2381
      lampLife: form.controls.lampLife.value,
      ballastFactor: form.controls.ballastFactor.value,
      lumenDegradationFactor: form.controls.lumenDegradationFactor.value,
      coefficientOfUtilization: form.controls.coefficientOfUtilization.value,
      category: form.controls.category.value,
      type: form.controls.type.value
    };
    tmpData = this.calculateElectricityUse(tmpData);
    tmpData = this.calculateTotalLighting(tmpData);
    return tmpData;
  }

  generateExample(isBaseline: boolean): LightingReplacementData {
    if (isBaseline) {
      const fixtureData = {
        category: 'Metal Halide',
        type: '350-W Metal Halide',
        lampsPerFixture: 1,
        wattsPerLamp: 400,
        lumensPerLamp: 36000,
        lampLife: 20000,
        coefficientOfUtilization: 0.7,
        ballastFactor: 1,
        lumenDegradationFactor: 0.8
      };
      let exampleData: LightingReplacementData = {
        name: 'Fixture #1',
        hoursPerYear: 8760,
        wattsPerLamp: fixtureData.wattsPerLamp,
        lampsPerFixture: fixtureData.lampsPerFixture,
        numberOfFixtures: 452,
        lumensPerLamp: fixtureData.lumensPerLamp,
        totalLighting: 1,
        electricityUse: 1,
        lampLife: fixtureData.lampLife,
        ballastFactor: fixtureData.ballastFactor,
        lumenDegradationFactor: fixtureData.lumenDegradationFactor,
        coefficientOfUtilization: fixtureData.coefficientOfUtilization,
        category: 1,
        type: '350-W Metal Halide'
      }
      exampleData = this.calculateElectricityUse(exampleData);
      exampleData = this.calculateTotalLighting(exampleData);
      return exampleData;
    } else {
      const fixtureData = {
        category: 'High Bay LED',
        type: 'LED HID Replacement - 150W Equivalent',
        lampsPerFixture: 1,
        wattsPerLamp: 150,
        lumensPerLamp: 21000,
        lampLife: 50000,
        coefficientOfUtilization: 0.8,
        ballastFactor: 1,
        lumenDegradationFactor: 0.9
      };
      let exampleData: LightingReplacementData = {
        name: 'Fixture #1',
        hoursPerYear: 8760,
        wattsPerLamp: fixtureData.wattsPerLamp,
        lampsPerFixture: fixtureData.lampsPerFixture,
        numberOfFixtures: 452,
        lumensPerLamp: fixtureData.lumensPerLamp,
        totalLighting: 1,
        electricityUse: 1,
        lampLife: fixtureData.lampLife,
        ballastFactor: fixtureData.ballastFactor,
        lumenDegradationFactor: fixtureData.lumenDegradationFactor,
        coefficientOfUtilization: fixtureData.coefficientOfUtilization,
        category: 9,
        type: 'LED HID Replacement - 150W Equivalent'
      }
      exampleData = this.calculateElectricityUse(exampleData);
      exampleData = this.calculateTotalLighting(exampleData);
      return exampleData;
    }
  }

  calculateElectricityUse(data: LightingReplacementData): LightingReplacementData {
    data.electricityUse = data.wattsPerLamp * data.lampsPerFixture * data.numberOfFixtures * data.ballastFactor * (1 / 1000) * data.hoursPerYear;
    return data;
  }

  calculateTotalLighting(data: LightingReplacementData): LightingReplacementData {
    if (!data.lumenDegradationFactor) {
      data.lumenDegradationFactor = 1;
    }
    if (!data.coefficientOfUtilization) {
      data.coefficientOfUtilization = 1;
    }
    if (!data.lumensPerLamp) {
      data.lumensPerLamp = 1;
    }
    data.totalLighting = data.coefficientOfUtilization * data.lumenDegradationFactor * data.lumensPerLamp * data.lampsPerFixture * data.ballastFactor * data.numberOfFixtures;
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

