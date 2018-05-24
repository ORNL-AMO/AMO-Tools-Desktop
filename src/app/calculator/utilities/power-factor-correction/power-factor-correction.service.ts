import { Injectable } from '@angular/core';
import { PowerFactorCorrectionInputs } from './power-factor-correction.component';

@Injectable()
export class PowerFactorCorrectionService {

  constructor() { }

  actualDemand(data: PowerFactorCorrectionInputs): number {
    return data.currentDemand * (data.currentPowerFactor / data.proposedPowerFactor);
  }

  apparentPower(data: PowerFactorCorrectionInputs): number {
    let actualDemand: number = this.actualDemand(data);
    return actualDemand / data.currentPowerFactor;
  }

  currentReactivePower(data: PowerFactorCorrectionInputs): number {
    let apparentPower: number = this.apparentPower(data);
    let actualDemand: number = this.actualDemand(data);
    return Math.sqrt((apparentPower * apparentPower) - (actualDemand * actualDemand));
  }

  demandSavings(data: PowerFactorCorrectionInputs): number {
    let actualDemand: number = this.actualDemand(data);
    return data.currentDemand - actualDemand;
  }

  capacitanceRequired(data: PowerFactorCorrectionInputs): number {
    let actualDemand: number = this.actualDemand(data);
    return actualDemand * Math.tan(Math.acos(data.currentPowerFactor) - Math.acos(data.proposedPowerFactor));
  }
}
