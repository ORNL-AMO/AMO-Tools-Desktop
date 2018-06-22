import { Injectable } from '@angular/core';
import { PowerFactorCorrectionInputs } from './power-factor-correction.component';

@Injectable()
export class PowerFactorCorrectionService {

  constructor() { }




  existingApparentPower(data: PowerFactorCorrectionInputs): number {
    return data.existingDemand / data.currentPowerFactor;
  }

  existingReactivePower(data: PowerFactorCorrectionInputs): number {
    let apparentPower: number = this.existingApparentPower(data);
    return Math.sqrt((apparentPower * apparentPower) - (data.existingDemand * data.existingDemand));
  }

  proposedApparentPower(data: PowerFactorCorrectionInputs): number {
    return data.existingDemand / data.proposedPowerFactor;
  }

  proposedReactivePower(data: PowerFactorCorrectionInputs): number {
    let apparentPower: number = this.proposedApparentPower(data);
    return Math.sqrt((apparentPower * apparentPower) - (data.existingDemand * data.existingDemand));
  }

  capacitancePowerRequired(data: PowerFactorCorrectionInputs): number {
    return this.existingReactivePower(data) - this.proposedReactivePower(data);
  }
}
