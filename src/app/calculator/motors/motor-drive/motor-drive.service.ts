import { Injectable } from '@angular/core';
import { MotorDriveInputs, MotorDriveOutputs } from './motor-drive.component';

@Injectable()
export class MotorDriveService {

  constructor() { }

  getResults(data: MotorDriveInputs): MotorDriveOutputs {
    let energy: number = this.getEnergy(data);
    let vBeltEnergyUsed: number = this.getVBeltEnergyUse(energy);
    let synchronousBeltEnergyUsed: number = this.getSynchronousEnergyUse(energy);
    let notchedEnergyUsed: number = this.getNotchedEnergyUse(energy);

    let motorDriveOutputs: MotorDriveOutputs = {
      vBeltResults: {
        energyCost: this.getCost(vBeltEnergyUsed, data.electricityCost),
        annualEnergyUse: vBeltEnergyUsed
      },
      synchronousBeltDrive: {
        energyCost: this.getCost(synchronousBeltEnergyUsed, data.electricityCost),
        annualEnergyUse: synchronousBeltEnergyUsed
      },
      notchedResults: {
        energyCost: this.getCost(notchedEnergyUsed, data.electricityCost),
        annualEnergyUse: notchedEnergyUsed
      }
    }
    return motorDriveOutputs;
  }

  getCost(data: number, cost: number) {
    return data * cost;
  }

  getEnergy(data: MotorDriveInputs): number {
    return (data.motorPower * .746 * data.annualOperatingHours * data.averageMotorLoad);
  }

  getVBeltEnergyUse(data: number): number {
    return data / .93;
  }

  getSynchronousEnergyUse(data: number): number {
    return data / .95;
  }

  getNotchedEnergyUse(data: number): number {
    return data / .98;
  }

}
