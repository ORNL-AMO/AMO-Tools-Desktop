import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class ElectricityReductionService {

  baselineData: Array<ElectricityReductionData>;
  modificationData: Array<ElectricityReductionData>;

  constructor(private formBuilder: FormBuilder) { }

  // initObject(resetStoredData: boolean, settings?: Settings): ElectricityReductionData {
  //   let obj: ElectricityReductionData = {
  //     hoursPerDay: 0,
  //     daysPerMonth: 30,
  //     monthsPerYear: 12,
  //     electricityCost: settings && settings.electricityCost ? settings.electricityCost : 0.12,


  //   }

  //   return obj;
  // }

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
      powerFactor: [0.85, [GreaterThanValidator.greaterThan(0), Validators.max(1)]]
    });
    return form;
  }

  getFormFromObj(obj: ElectricityReductionData): FormGroup {
    let form: FormGroup;
    switch (obj.measurementMethod) {
      case 0:
        //multimeter reading
        if (obj.mulitmeterData) {
          form = this.formBuilder.group({
            hoursPerDay: [obj.hoursPerDay, [Validators.required, Validators.min(0), Validators.max(24)]],
            daysPerMonth: [obj.daysPerMonth, [Validators.required, Validators.min(0), Validators.max(31)]],
            monthsPerYear: [obj.monthsPerYear, [Validators.required, Validators.min(0), Validators.max(12)]],
            electricityCost: [obj.electricityCost, [Validators.required, Validators.min(0)]],
            measurementMethod: [0],
            numberOfPhases: [obj.mulitmeterData.numberOfPhases, [Validators.required]],
            supplyVoltage: [obj.mulitmeterData.supplyVoltage, [Validators.required, Validators.min(0)]],
            averageCurrent: [obj.mulitmeterData.averageCurrent, [Validators.required, Validators.min(0)]],
            powerFactor: [obj.mulitmeterData.powerFactor, [GreaterThanValidator.greaterThan(0), Validators.max(1)]]
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
          loadFactor: [obj.nameplateData.loadFactor, [Validators.required, Validators.min(0), Validators.max(100)]]
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

        })
    }
    return form;
  }

  getObjFromForm(form: FormGroup): ElectricityReductionData {
    let tmpObj: ElectricityReductionData;
    switch (form.controls.measurementMethod.value) {
      case 0:
    }
    return tmpObj;
  }
}


export interface ElectricityReductionData {
  hoursPerDay: number,
  daysPerMonth: number,
  monthsPerYear: number,
  electricityCost: number,
  measurementMethod: number, // 0 = multimeter reading, 1 = name plate data, 2 = power meter method, 3 = offsheet / other method 
  mulitmeterData?: MultimeterReadingData,
  nameplateData?: NameplateData,
  powerMeterData?: PowerMeterData,
  otherMethodData?: OtherMethodData
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
  units: number
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