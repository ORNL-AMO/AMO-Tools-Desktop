import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { ElectricityReductionData, MultimeterReadingData, NameplateData, PowerMeterData, OtherMethodData, ElectricityReductionResults, ElectricityReductionInput, ElectricityReductionResult } from '../../../shared/models/standalone';
import { StandaloneService } from '../../standalone.service';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class ElectricityReductionService {

  baselineData: Array<ElectricityReductionData>;
  modificationData: Array<ElectricityReductionData>;
  operatingHours: OperatingHours;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }

  initObject(index: number, settings: Settings, operatingHours: OperatingHours): ElectricityReductionData {
    let defaultMultimeterObj: MultimeterReadingData = {
      numberOfPhases: 3,
      supplyVoltage: 0,
      averageCurrent: 0,
      powerFactor: 0.85
    };

    let defaultNameplateObj: NameplateData = {
      ratedMotorPower: settings.powerMeasurement === undefined ? 200 : this.convertUnitsService.value(200).from('hp').to(settings.powerMeasurement),
      variableSpeedMotor: true,
      operationalFrequency: 50,
      lineFrequency: 60,
      motorAndDriveEfficiency: 100,
      loadFactor: 10
    };

    let defaultPowerMeterObj: PowerMeterData = {
      power: 50,
    };

    let defaultOtherMethodData: OtherMethodData = {
      energy: 400000
    };

    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let electricityCost: number = .12;
    if (settings && settings.electricityCost) {
      electricityCost = settings.electricityCost;
    }

    let obj: ElectricityReductionData = {
      name: 'Equipment #' + (index + 1),
      operatingHours: hoursPerYear,
      electricityCost: electricityCost,
      measurementMethod: 0,
      multimeterData: defaultMultimeterObj,
      nameplateData: defaultNameplateObj,
      powerMeterData: defaultPowerMeterObj,
      otherMethodData: defaultOtherMethodData,
      units: 1
    };

    return obj;
  }

  getFormFromObj(initObj: ElectricityReductionData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [initObj.name, [Validators.required]],
      operatingHours: [initObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      electricityCost: [initObj.electricityCost],
      measurementMethod: [initObj.measurementMethod],

      // multimeter data
      numberOfPhases: [initObj.multimeterData.numberOfPhases],
      supplyVoltage: [initObj.multimeterData.supplyVoltage],
      averageCurrent: [initObj.multimeterData.averageCurrent],
      powerFactor: [initObj.multimeterData.powerFactor],

      // nameplate data
      ratedMotorPower: [initObj.nameplateData.ratedMotorPower],
      variableSpeedMotor: [initObj.nameplateData.variableSpeedMotor],
      operationalFrequency: [initObj.nameplateData.operationalFrequency],
      lineFrequency: [initObj.nameplateData.lineFrequency],
      motorAndDriveEfficiency: [initObj.nameplateData.motorAndDriveEfficiency],
      loadFactor: [initObj.nameplateData.loadFactor],

      // power meter data
      power: [initObj.powerMeterData.power],

      // offsheet / other data
      energy: [initObj.otherMethodData.energy],

      units: [initObj.units]
    });
    form = this.setValidators(form);
    return form;
  }

  setValidators(form: FormGroup): FormGroup {
    switch (form.controls.measurementMethod.value) {
      case 0:
        form.controls.electricityCost.setValidators([Validators.required, Validators.min(0)]);
        form.controls.numberOfPhases.setValidators([Validators.required]);
        form.controls.supplyVoltage.setValidators([Validators.required, Validators.min(0)]);
        form.controls.averageCurrent.setValidators([Validators.required, Validators.min(0)]);
        form.controls.powerFactor.setValidators([Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(1)]);
        form.controls.units.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 1:
        form.controls.electricityCost.setValidators([Validators.required, Validators.min(0)]);
        form.controls.ratedMotorPower.setValidators([Validators.required, Validators.min(0)]);
        form.controls.operationalFrequency.setValidators([Validators.required, Validators.min(0)]);
        form.controls.motorAndDriveEfficiency.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        form.controls.loadFactor.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        form.controls.units.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 2:
        form.controls.power.setValidators([Validators.required, Validators.min(0)]);
        form.controls.units.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 3:
        form.controls.energy.setValidators([Validators.required, Validators.min(0)]);
        break;
    }
    return form;
  }

  getObjFromForm(form: FormGroup): ElectricityReductionData {
    let multimeterObj: MultimeterReadingData = {
      numberOfPhases: form.controls.numberOfPhases.value,
      supplyVoltage: form.controls.supplyVoltage.value,
      averageCurrent: form.controls.averageCurrent.value,
      powerFactor: form.controls.powerFactor.value
    };

    let nameplateObj: NameplateData = {
      ratedMotorPower: form.controls.ratedMotorPower.value,
      variableSpeedMotor: form.controls.variableSpeedMotor.value,
      operationalFrequency: form.controls.operationalFrequency.value,
      lineFrequency: form.controls.lineFrequency.value,
      motorAndDriveEfficiency: form.controls.motorAndDriveEfficiency.value,
      loadFactor: form.controls.loadFactor.value
    };

    let powerMeterObj: PowerMeterData = {
      power: form.controls.power.value,
    };

    let otherMethodData: OtherMethodData = {
      energy: form.controls.energy.value
    };

    let obj: ElectricityReductionData = {
      name: form.controls.name.value,
      operatingHours: form.controls.operatingHours.value,
      electricityCost: form.controls.electricityCost.value,
      measurementMethod: form.controls.measurementMethod.value,
      multimeterData: multimeterObj,
      nameplateData: nameplateObj,
      powerMeterData: powerMeterObj,
      otherMethodData: otherMethodData,
      units: form.controls.units.value
    };
    return obj;
  }

  getResults(settings: Settings, baseline: Array<ElectricityReductionData>, modification?: Array<ElectricityReductionData>): ElectricityReductionResults {
    let baselineInpCpy: Array<ElectricityReductionData> = JSON.parse(JSON.stringify(baseline));

    let baselineResults: ElectricityReductionResult = this.calculate(baselineInpCpy, settings);
    let modificationResults: ElectricityReductionResult;
    let annualEnergySavings: number = 0;
    let annualCostSavings: number = 0;
    if (modification) {
      let modificationInpCpy: Array<ElectricityReductionData> = JSON.parse(JSON.stringify(modification));
      modificationResults = this.calculate(modificationInpCpy, settings);
    }
    let naturalGasReductionResults: ElectricityReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualCostSavings: annualCostSavings,
      annualEnergySavings: annualEnergySavings
    }
    if (modificationResults) {
      naturalGasReductionResults.annualEnergySavings = baselineResults.energyUse - modificationResults.energyUse;
      naturalGasReductionResults.annualCostSavings = baselineResults.energyCost - modificationResults.energyCost;
    }
    return naturalGasReductionResults;
  }
  
  calculate(input: Array<ElectricityReductionData>, settings: Settings): ElectricityReductionResult {
    let inputArray: Array<ElectricityReductionData> = this.convertInputs(input, settings);
    let inputObj: ElectricityReductionInput = {
      electricityReductionInputVec: inputArray
    };
    let results: ElectricityReductionResult = this.standaloneService.electricityReduction(inputObj);
    return results;
  }

  calculateIndividualEquipment(input: ElectricityReductionData, settings: Settings): ElectricityReductionResult {
    let inputArray: Array<ElectricityReductionData> = JSON.parse(JSON.stringify([input]));
    inputArray = this.convertInputs(inputArray, settings);
    let inputObj: ElectricityReductionInput = {
      electricityReductionInputVec: inputArray
    };
    let results: ElectricityReductionResult = this.standaloneService.electricityReduction(inputObj);
    return results;
  }

  convertInputs(inputArray: Array<ElectricityReductionData>, settings: Settings): Array<ElectricityReductionData> {
    //need to loop through for conversions prior to calculation
    for (let i = 0; i < inputArray.length; i++) {
      inputArray[i].nameplateData.ratedMotorPower = this.convertUnitsService.value(inputArray[i].nameplateData.ratedMotorPower).from(settings.powerMeasurement).to('kW');
    }
    return inputArray;
  }
}
