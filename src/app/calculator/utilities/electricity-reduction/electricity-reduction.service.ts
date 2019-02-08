import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class ElectricityReductionService {

  baselineData: Array<ElectricityReductionData>;
  modificationData: Array<ElectricityReductionData>;

  constructor(private formBuilder: FormBuilder) { }

  initObject(settings?: Settings): ElectricityReductionData {
    let defaultMultimeterObj: MultimeterReadingData = {
      numberOfPhases: 3,
      supplyVoltage: 0,
      averageCurrent: 0,
      powerFactor: 0.85
    };

    let defaultNameplateObj: NameplateData = {
      ratedMotorPower: 200,
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

    let obj: ElectricityReductionData = {
      hoursPerDay: 0,
      daysPerMonth: 30,
      monthsPerYear: 12,
      electricityCost: settings && settings.electricityCost ? settings.electricityCost : 0.12,
      measurementMethod: 0,
      multimeterData: defaultMultimeterObj,
      nameplateData: defaultNameplateObj,
      powerMeterData: defaultPowerMeterObj,
      otherMethodData: defaultOtherMethodData,
      units: 1
    };

    return obj;
  }

  initForm(): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      hoursPerDay: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
      daysPerMonth: [0, [Validators.required, Validators.min(0), Validators.max(31)]],
      monthsPerYear: [0, [Validators.required, Validators.min(0), Validators.max(12)]],
      electricityCost: [0.12, [Validators.required, Validators.min(0)]],
      measurementMethod: [0],
      numberOfPhases: [1, [Validators.required]],
      supplyVoltage: [0, [Validators.required, Validators.min(0)]],
      averageCurrent: [0, [Validators.required, Validators.min(0)]],
      powerFactor: [0.85, [GreaterThanValidator.greaterThan(0), Validators.max(1)]],
      units: [1, [Validators.required, Validators.min(0)]]
    });
    return form;
  }

  getFormFromObj(obj: ElectricityReductionData): FormGroup {
    let form: FormGroup;
    switch (obj.measurementMethod) {
      case 0:
        //multimeter reading
        if (obj.multimeterData) {
          form = this.formBuilder.group({
            hoursPerDay: [obj.hoursPerDay, [Validators.required, Validators.min(0), Validators.max(24)]],
            daysPerMonth: [obj.daysPerMonth, [Validators.required, Validators.min(0), Validators.max(31)]],
            monthsPerYear: [obj.monthsPerYear, [Validators.required, Validators.min(0), Validators.max(12)]],
            electricityCost: [obj.electricityCost, [Validators.required, Validators.min(0)]],
            measurementMethod: [0],
            numberOfPhases: [obj.multimeterData.numberOfPhases, [Validators.required]],
            supplyVoltage: [obj.multimeterData.supplyVoltage, [Validators.required, Validators.min(0)]],
            averageCurrent: [obj.multimeterData.averageCurrent, [Validators.required, Validators.min(0)]],
            powerFactor: [obj.multimeterData.powerFactor, [GreaterThanValidator.greaterThan(0), Validators.max(1)]],
            units: [obj.units, [Validators.required, Validators.min(0)]]
          });
        }
        break;
      case 1:
        //name plate data
        form = this.formBuilder.group({
          hoursPerDay: [obj.hoursPerDay, [Validators.required, Validators.min(0), Validators.max(24)]],
          daysPerMonth: [obj.daysPerMonth, [Validators.required, Validators.min(0), Validators.max(31)]],
          monthsPerYear: [obj.monthsPerYear, [Validators.required, Validators.min(0), Validators.max(12)]],
          electricityCost: [obj.electricityCost, [Validators.required, Validators.min(0)]],
          measurementMethod: [1],
          ratedMotorPower: [obj.nameplateData.ratedMotorPower, [Validators.required, Validators.min(0)]],
          variableSpeedMotor: [obj.nameplateData.variableSpeedMotor],
          operationalFrequency: [obj.nameplateData.operationalFrequency, [Validators.required, Validators.min(0)]],
          lineFrequency: [obj.nameplateData.lineFrequency],
          motorAndDriveEfficiency: [obj.nameplateData.motorAndDriveEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
          loadFactor: [obj.nameplateData.loadFactor, [Validators.required, Validators.min(0), Validators.max(100)]],
          units: [obj.units, [Validators.required, Validators.min(0)]]
        });
        break;
      case 2:
        //power meter data
        form = this.formBuilder.group({
          hoursPerDay: [obj.hoursPerDay, [Validators.required, Validators.min(0), Validators.max(24)]],
          daysPerMonth: [obj.daysPerMonth, [Validators.required, Validators.min(0), Validators.max(31)]],
          monthsPerYear: [obj.monthsPerYear, [Validators.required, Validators.min(0), Validators.max(12)]],
          electricityCost: [obj.electricityCost, [Validators.required, Validators.min(0)]],
          measurementMethod: [2],
          power: [obj.powerMeterData.power, [Validators.required, Validators.min(0)]],
          units: [obj.units, [Validators.required, Validators.min(0)]]
        });
        break;
      case 3:
        //power meter data
        form = this.formBuilder.group({
          hoursPerDay: [obj.hoursPerDay, [Validators.required, Validators.min(0), Validators.max(24)]],
          daysPerMonth: [obj.daysPerMonth, [Validators.required, Validators.min(0), Validators.max(31)]],
          monthsPerYear: [obj.monthsPerYear, [Validators.required, Validators.min(0), Validators.max(12)]],
          electricityCost: [obj.electricityCost, [Validators.required, Validators.min(0)]],
          measurementMethod: [3],
          energy: [obj.otherMethodData.energy, [Validators.required, Validators.min(0)]]
        });
        break;
      default:
        break;
    }
    return form;
  }

  getObjFromForm(form: FormGroup, index: number, isBaseline: boolean): ElectricityReductionData {
    let tmpObj: ElectricityReductionData;
    switch (form.controls.measurementMethod.value) {
      case 0:
        let tmpMultimeterData: MultimeterReadingData = {
          numberOfPhases: form.controls.numberOfPhases.value,
          supplyVoltage: form.controls.supplyVoltage.value,
          averageCurrent: form.controls.averageCurrent.value,
          powerFactor: form.controls.powerFactor.value
        };
        tmpObj = {
          hoursPerDay: form.controls.hoursPerDay.value,
          daysPerMonth: form.controls.daysPerMonth.value,
          monthsPerYear: form.controls.monthsPerYear.value,
          electricityCost: form.controls.electricityCost.value,
          measurementMethod: 0,
          multimeterData: tmpMultimeterData,
          nameplateData: isBaseline ? this.baselineData[index].nameplateData : this.modificationData[index].nameplateData,
          powerMeterData: isBaseline ? this.baselineData[index].powerMeterData : this.modificationData[index].powerMeterData,
          otherMethodData: isBaseline ? this.baselineData[index].otherMethodData : this.modificationData[index].otherMethodData,
          units: form.controls.units.value
        };
        break;
      case 1:
        let tmpNameplateData: NameplateData = {
          ratedMotorPower: form.controls.ratedMotorPower.value,
          variableSpeedMotor: form.controls.variableSpeedMotor.value,
          operationalFrequency: form.controls.operationalFrequency.value,
          lineFrequency: form.controls.lineFrequency.value,
          motorAndDriveEfficiency: form.controls.motorAndDriveEfficiency.value,
          loadFactor: form.controls.loadFactor.value
        };
        tmpObj = {
          hoursPerDay: form.controls.hoursPerDay.value,
          daysPerMonth: form.controls.daysPerMonth.value,
          monthsPerYear: form.controls.monthsPerYear.value,
          electricityCost: form.controls.electricityCost.value,
          measurementMethod: 1,
          multimeterData: isBaseline ? this.baselineData[index].multimeterData : this.modificationData[index].multimeterData,
          nameplateData: tmpNameplateData,
          powerMeterData: isBaseline ? this.baselineData[index].powerMeterData : this.modificationData[index].powerMeterData,
          otherMethodData: isBaseline ? this.baselineData[index].otherMethodData : this.modificationData[index].otherMethodData,
          units: form.controls.units.value
        };
        break;
      case 2:
        let tmpPowerMeterData: PowerMeterData = {
          power: form.controls.power.value,
        };
        tmpObj = {
          hoursPerDay: form.controls.hoursPerDay.value,
          daysPerMonth: form.controls.daysPerMonth.value,
          monthsPerYear: form.controls.monthsPerYear.value,
          electricityCost: form.controls.electricityCost.value,
          measurementMethod: 2,
          multimeterData: isBaseline ? this.baselineData[index].multimeterData : this.modificationData[index].multimeterData,
          nameplateData: isBaseline ? this.baselineData[index].nameplateData : this.modificationData[index].nameplateData,
          powerMeterData: tmpPowerMeterData,
          otherMethodData: isBaseline ? this.baselineData[index].otherMethodData : this.modificationData[index].otherMethodData,
          units: form.controls.units.value
        };
        break;
      case 3:
        let tmpOtherMethodData: OtherMethodData = {
          energy: form.controls.energy.value,
        };
        tmpObj = {
          hoursPerDay: form.controls.hoursPerDay.value,
          daysPerMonth: form.controls.daysPerMonth.value,
          monthsPerYear: form.controls.monthsPerYear.value,
          electricityCost: form.controls.electricityCost.value,
          measurementMethod: 3,
          multimeterData: isBaseline ? this.baselineData[index].multimeterData : this.modificationData[index].multimeterData,
          nameplateData: isBaseline ? this.baselineData[index].nameplateData : this.modificationData[index].nameplateData,
          powerMeterData: isBaseline ? this.baselineData[index].powerMeterData : this.modificationData[index].powerMeterData,
          otherMethodData: tmpOtherMethodData,
          units: isBaseline ? this.baselineData[index].units : this.modificationData[index].units
        };
        break;
      default:
        break;
    }
    return tmpObj;
  }

  addBaselineEquipment(settings?: Settings) {
    if (this.baselineData !== null && this.baselineData !== undefined) {
      this.baselineData.push(this.initObject(settings ? settings : null));
    }
    else {
      this.baselineData = new Array<ElectricityReductionData>();
      this.baselineData.push(this.initObject(settings ? settings : null));
    }
  }

  addModificationEquipment(settings?: Settings) {
    if (this.modificationData !== null && this.modificationData !== undefined) {
      this.modificationData.push(this.initObject(settings ? settings : null));
    }
    else {
      this.modificationData = new Array<ElectricityReductionData>();
      this.modificationData.push(this.initObject(settings ? settings : null));
    }
  }

  initModificationData() {
    if (this.modificationData === undefined || this.modificationData === null) {
      this.modificationData = new Array<ElectricityReductionData>();
    }
  }
}


export interface ElectricityReductionData {
  hoursPerDay: number,
  daysPerMonth: number,
  monthsPerYear: number,
  electricityCost: number,
  measurementMethod: number, // 0 = multimeter reading, 1 = name plate data, 2 = power meter method, 3 = offsheet / other method
  multimeterData?: MultimeterReadingData,
  nameplateData?: NameplateData,
  powerMeterData?: PowerMeterData,
  otherMethodData?: OtherMethodData,
  units?: number
}

export interface MultimeterReadingData {
  numberOfPhases: number,
  supplyVoltage: number,
  averageCurrent: number,
  powerFactor: number
}

export interface NameplateData {
  ratedMotorPower: number,
  variableSpeedMotor: boolean,
  operationalFrequency?: number,
  lineFrequency: number,
  motorAndDriveEfficiency: number,
  loadFactor: number
}

export interface PowerMeterData {
  power: number,
}

export interface OtherMethodData {
  energy: number;
}

export interface ElectricityReductionResults {
  energyUse: number,
  energyCost: number,
  annualEnergySavings: number,
  costSavings: number
}