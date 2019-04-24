import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MotorDriveInputs, MotorDriveOutputs, DriveResult } from '../../../shared/models/calculators';

@Injectable()
export class MotorDriveService {
  motorDriveData: MotorDriveInputs;
  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(inputObj: MotorDriveInputs): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      motorPower: [inputObj.motorPower, [Validators.required]],
      annualOperatingHours: [inputObj.annualOperatingHours, [Validators.required, Validators.min(0)]],
      averageMotorLoad: [inputObj.averageMotorLoad, [Validators.required]],
      electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]],
      baselineDriveType: [inputObj.baselineDriveType, [Validators.required]],
      modificationDriveType: [inputObj.modificationDriveType, [Validators.required]]
    });
    return tmpForm;
  }

  getObjFromForm(form: FormGroup): MotorDriveInputs {
    let inputs: MotorDriveInputs = {
      motorPower: form.controls.motorPower.value,
      annualOperatingHours: form.controls.annualOperatingHours.value,
      averageMotorLoad: form.controls.averageMotorLoad.value,
      electricityCost: form.controls.electricityCost.value,
      baselineDriveType: form.controls.baselineDriveType.value,
      modificationDriveType: form.controls.modificationDriveType.value,
    };
    return inputs;
  }

  getResults(data: MotorDriveInputs): MotorDriveOutputs {
    let energy: number = this.getEnergy(data);
    let vBeltEnergyUsed: number = this.getVBeltEnergyUse(energy);
    let synchronousBeltEnergyUsed: number = this.getSynchronousEnergyUse(energy);
    let notchedEnergyUsed: number = this.getNotchedEnergyUse(energy);
    //0
    let vBeltResults: DriveResult = {
      energyCost: this.getCost(vBeltEnergyUsed, data.electricityCost) / 1000,
      annualEnergyUse: vBeltEnergyUsed / 1000,
      driveEfficiency: 93
    };
    //1
    let notchedResults: DriveResult = {
      energyCost: this.getCost(notchedEnergyUsed, data.electricityCost) / 1000,
      annualEnergyUse: notchedEnergyUsed / 1000,
      driveEfficiency: 95
    };
    //2
    let synchronousBeltDrive: DriveResult = {
      energyCost: this.getCost(synchronousBeltEnergyUsed, data.electricityCost) / 1000,
      annualEnergyUse: synchronousBeltEnergyUsed / 1000,
      driveEfficiency: 98
    };
    let baselineResult: DriveResult = vBeltResults;
    let modificationResults: DriveResult = vBeltResults;
    if (data.baselineDriveType == 1) {
      baselineResult = notchedResults;
    } else if (data.baselineDriveType == 2) {
      baselineResult = synchronousBeltDrive;
    }
    if (data.modificationDriveType == 1) {
      modificationResults = notchedResults;
    } else if (data.modificationDriveType == 2) {
      modificationResults = synchronousBeltDrive;
    }
    let annualCostSavings: number = baselineResult.energyCost - modificationResults.energyCost;
    let annualEnergySavings: number = baselineResult.annualEnergyUse - modificationResults.annualEnergyUse;
    return {
      vBeltResults: vBeltResults,
      notchedResults: notchedResults,
      synchronousBeltDrive: synchronousBeltDrive,
      baselineResult: baselineResult,
      modificationResult: modificationResults,
      annualCostSavings: annualCostSavings,
      annualEnergySavings: annualEnergySavings
    };
  }

  getCost(data: number, cost: number) {
    return data * cost;
  }

  getEnergy(data: MotorDriveInputs): number {
    return (data.motorPower * .746 * data.annualOperatingHours * (data.averageMotorLoad / 100));
  }

  getVBeltEnergyUse(data: number): number {
    return data / .93;
  }

  getSynchronousEnergyUse(data: number): number {
    return data / .98;
  }

  getNotchedEnergyUse(data: number): number {
    return data / .95;
  }

}
