import { Injectable } from '@angular/core';
import { MotorDriveInputs, MotorDriveOutputs } from './motor-drive.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class MotorDriveService {
  motorDriveData: MotorDriveInputs
  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(inputObj: MotorDriveInputs): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      motorPower: [inputObj.motorPower, [Validators.required]],
      annualOperatingHours: [inputObj.annualOperatingHours, [Validators.required, Validators.min(0)]],
      averageMotorLoad: [inputObj.averageMotorLoad, [Validators.required]],
      electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]]
    });
    return tmpForm;
  }

  getObjFromForm(form: FormGroup): MotorDriveInputs {
    let inputs: MotorDriveInputs = {
      motorPower: form.controls.motorPower.value,
      annualOperatingHours: form.controls.annualOperatingHours.value,
      averageMotorLoad: form.controls.averageMotorLoad.value,
      electricityCost: form.controls.electricityCost.value,
    }
    return inputs;
  }

  getResults(data: MotorDriveInputs): MotorDriveOutputs {
    let energy: number = this.getEnergy(data);
    let vBeltEnergyUsed: number = this.getVBeltEnergyUse(energy);
    let synchronousBeltEnergyUsed: number = this.getSynchronousEnergyUse(energy);
    let notchedEnergyUsed: number = this.getNotchedEnergyUse(energy);

    let motorDriveOutputs: MotorDriveOutputs = {
      vBeltResults: {
        energyCost: this.getCost(vBeltEnergyUsed, data.electricityCost) / 1000,
        annualEnergyUse: vBeltEnergyUsed / 1000
      },
      synchronousBeltDrive: {
        energyCost: this.getCost(synchronousBeltEnergyUsed, data.electricityCost) / 1000,
        annualEnergyUse: synchronousBeltEnergyUsed / 1000
      },
      notchedResults: {
        energyCost: this.getCost(notchedEnergyUsed, data.electricityCost) / 1000,
        annualEnergyUse: notchedEnergyUsed / 1000
      }
    }
    return motorDriveOutputs;
  }

  getCost(data: number, cost: number) {
    return data * cost;
  }

  getEnergy(data: MotorDriveInputs): number {
    return (data.motorPower * .746 * data.annualOperatingHours * (data.averageMotorLoad/100));
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
