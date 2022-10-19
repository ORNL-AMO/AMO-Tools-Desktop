import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MotorDriveInputs, MotorDriveOutputs, DriveResult } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class MotorDriveService {
  motorDriveData: MotorDriveInputs;
  operatingHours: OperatingHours;
  constructor(private formBuilder: UntypedFormBuilder) { }

  generateExample(settings: Settings): MotorDriveInputs{
    return {
      motorPower: 5,
      annualOperatingHours: 8760,
      averageMotorLoad: 50,
      electricityCost: settings.electricityCost,
      baselineDriveType: 0,
      modificationDriveType: 2
    }
  }
  getResetData(settings: Settings): MotorDriveInputs{
    return {
      motorPower: 0,
      annualOperatingHours: 0,
      averageMotorLoad: 0,
      electricityCost: settings.electricityCost,
      baselineDriveType: 0,
      modificationDriveType: 0
    }
  }

  getFormFromObj(inputObj: MotorDriveInputs): UntypedFormGroup {
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      motorPower: [inputObj.motorPower, [Validators.required, Validators.min(0)]],
      annualOperatingHours: [inputObj.annualOperatingHours, [Validators.required, Validators.min(0)]],
      averageMotorLoad: [inputObj.averageMotorLoad, [Validators.required]],
      electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]],
      baselineDriveType: [inputObj.baselineDriveType, [Validators.required]],
      modificationDriveType: [inputObj.modificationDriveType, [Validators.required]]
    });
    return tmpForm;
  }

  getObjFromForm(form: UntypedFormGroup): MotorDriveInputs {
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
    let vBeltEfficiency: number = 93;
    let notchedBeltEfficiency: number = 95;
    let synchronousBeltEfficiency: number = 98;
    let directDriveEfficiency: number = 100;


    let energy: number = this.getEnergy(data);
    let vBeltEnergyUsed: number = this.getEnergyUse(energy, vBeltEfficiency);
    let synchronousBeltEnergyUsed: number = this.getEnergyUse(energy, synchronousBeltEfficiency);
    let notchedEnergyUsed: number = this.getEnergyUse(energy, notchedBeltEfficiency);
    let directDriveEnergyUsed: number = this.getEnergyUse(energy, directDriveEfficiency);
    //0
    let vBeltResults: DriveResult = {
      energyCost: this.getCost(vBeltEnergyUsed, data.electricityCost),
      annualEnergyUse: vBeltEnergyUsed,
      driveEfficiency: vBeltEfficiency
    };
    //1
    let notchedResults: DriveResult = {
      energyCost: this.getCost(notchedEnergyUsed, data.electricityCost),
      annualEnergyUse: notchedEnergyUsed,
      driveEfficiency: notchedBeltEfficiency
    };
    //2
    let synchronousBeltDrive: DriveResult = {
      energyCost: this.getCost(synchronousBeltEnergyUsed, data.electricityCost),
      annualEnergyUse: synchronousBeltEnergyUsed,
      driveEfficiency: synchronousBeltEfficiency
    };
    //3
    let directDrive: DriveResult = {
      energyCost: this.getCost(directDriveEnergyUsed, data.electricityCost),
      annualEnergyUse: directDriveEnergyUsed,
      driveEfficiency: directDriveEfficiency
    };

    let baselineResult: DriveResult = vBeltResults;
    let modificationResults: DriveResult = vBeltResults;
    if (data.baselineDriveType == 1) {
      baselineResult = notchedResults;
    } else if (data.baselineDriveType == 2) {
      baselineResult = synchronousBeltDrive;
    } else if(data.baselineDriveType == 3){
      baselineResult = directDrive;
    }
    if (data.modificationDriveType == 1) {
      modificationResults = notchedResults;
    } else if (data.modificationDriveType == 2) {
      modificationResults = synchronousBeltDrive;
    } else if(data.modificationDriveType == 3){
      modificationResults = directDrive;
    }
    let annualCostSavings: number = baselineResult.energyCost - modificationResults.energyCost;
    let annualEnergySavings: number = baselineResult.annualEnergyUse - modificationResults.annualEnergyUse;
    return {
      vBeltResults: vBeltResults,
      notchedResults: notchedResults,
      synchronousBeltDrive: synchronousBeltDrive,
      directDrive: directDrive,
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

  getEnergyUse(energy: number, efficiency: number){
    return energy / (efficiency / 100);
  }
}
