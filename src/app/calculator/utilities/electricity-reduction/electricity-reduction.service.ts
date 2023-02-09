import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
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
  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }

  initObject(index: number, settings: Settings, operatingHours: OperatingHours): ElectricityReductionData {
    let defaultMultimeterObj: MultimeterReadingData = {
      numberOfPhases: 3,
      supplyVoltage: 0,
      averageCurrent: 0,
      powerFactor: 0.85
    };
    let ratedMotorPower: number = 200;
    let hpSelected: boolean = true;
    if (settings.unitsOfMeasure != 'Imperial') {
      ratedMotorPower = this.convertUnitsService.value(ratedMotorPower).from('hp').to(settings.powerMeasurement);
      ratedMotorPower = Number(ratedMotorPower.toFixed(2));
      hpSelected = false;
    }

    let defaultNameplateObj: NameplateData = {
      ratedMotorPower: ratedMotorPower,
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
      units: 1,
      userSelectedHP: hpSelected
    };

    return obj;
  }

  getFormFromObj(initObj: ElectricityReductionData): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
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

      units: [initObj.units],
      
      userSelectedHP: [initObj.userSelectedHP]
    });
    form = this.setValidators(form);
    return form;
  }

  setValidators(form: UntypedFormGroup): UntypedFormGroup {
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

  getObjFromForm(form: UntypedFormGroup): ElectricityReductionData {
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
      units: form.controls.units.value,
      userSelectedHP: form.controls.userSelectedHP.value
    };
    return obj;
  }

  generateExample(settings: Settings, isBaseline: boolean): ElectricityReductionData {
    let defaultData: ElectricityReductionData
    let ratedMotorPower: number = 200;
    let hpSelected: boolean = true;
    if (settings.unitsOfMeasure != 'Imperial') {
      ratedMotorPower = this.convertUnitsService.value(ratedMotorPower).from('hp').to(settings.powerMeasurement);
      ratedMotorPower = Number(ratedMotorPower.toFixed(2));
      hpSelected = false
    }

    if (isBaseline) {
      defaultData = {
        name: 'Equipment #1',
        operatingHours: 8760,
        electricityCost: settings.electricityCost,
        measurementMethod: 1,
        multimeterData: {
          numberOfPhases: 3,
          supplyVoltage: 0,
          averageCurrent: 0,
          powerFactor: 0.0
        },
        nameplateData: {
          ratedMotorPower: ratedMotorPower,
          variableSpeedMotor: true,
          operationalFrequency: 50,
          lineFrequency: 60,
          motorAndDriveEfficiency: 100,
          loadFactor: 10
        },
        powerMeterData: {
          power: 0
        },
        otherMethodData: {
          energy: 0
        },
        units: 1,
        userSelectedHP: hpSelected
      };
    }
    else {
      defaultData = {
        name: 'Equipment #1',
        operatingHours: 8760,
        electricityCost: settings.electricityCost,
        measurementMethod: 1,
        multimeterData: {
          numberOfPhases: 3,
          supplyVoltage: 0,
          averageCurrent: 0,
          powerFactor: 0.0
        },
        nameplateData: {
          ratedMotorPower: 150,
          variableSpeedMotor: true,
          operationalFrequency: 50,
          lineFrequency: 60,
          motorAndDriveEfficiency: 100,
          loadFactor: 10
        },
        powerMeterData: {
          power: 0
        },
        otherMethodData: {
          energy: 0
        },
        units: 1,
        userSelectedHP: hpSelected
      };
    }

    return defaultData;
  }

  getResults(settings: Settings, baseline: Array<ElectricityReductionData>, modification?: Array<ElectricityReductionData>): ElectricityReductionResults {
    let baselineInpCpy: Array<ElectricityReductionData> = JSON.parse(JSON.stringify(baseline));
    let baselineResults: ElectricityReductionResult = this.calculate(baselineInpCpy, settings);
    let modificationResults: ElectricityReductionResult = {
      energyUse: 0,
      energyCost: 0,
      power: 0
    };
    if (modification) {
      let modificationInpCpy: Array<ElectricityReductionData> = JSON.parse(JSON.stringify(modification));
      modificationResults = this.calculate(modificationInpCpy, settings);
    }else{
      modificationResults = baselineResults;
    }
    let naturalGasReductionResults: ElectricityReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualCostSavings: 0,
      annualEnergySavings: 0
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
        if(inputArray[i].userSelectedHP === true){
          inputArray[i].nameplateData.ratedMotorPower = this.convertUnitsService.value(inputArray[i].nameplateData.ratedMotorPower).from('hp').to('kW');
        }
      }
    return inputArray;
  }

  checkWarnings(index: number, isBaseline: boolean): string{
    if (!isBaseline) {
      if (this.baselineData[index].multimeterData.powerFactor != this.modificationData[index].multimeterData.powerFactor) {
        if (this.baselineData[index].multimeterData.averageCurrent <= this.modificationData[index].multimeterData.averageCurrent) {
          return 'Power factor should not be reduced without also reducing the average current';
        } else {
          return null;
        }
      } else if (this.baselineData[index].multimeterData.powerFactor == this.modificationData[index].multimeterData.powerFactor) {
        return null;
      }
    } else {
      return null;
    }
  }

}
