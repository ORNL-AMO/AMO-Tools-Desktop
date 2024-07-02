import { Injectable } from '@angular/core';
import { PowerFactorCorrectionInputs } from './power-factor-correction.component';

@Injectable()
export class PowerFactorCorrectionService {
  inputData: PowerFactorCorrectionInputs;
  constructor() { }

  generateExample(): PowerFactorCorrectionInputs {
    return {
      existingDemand: 286,
      currentPowerFactor: 0.88,
      proposedPowerFactor: 0.95,
      billedForDemand: 0,
      minimumPowerFactor: 0.95,
      targetPowerFactor: 0.95,
      adjustedOrActual: 0,
      marginalCostOfDemand: 8.15,
      costOfStaticCapacitance: 50,
      costOfDynamicCapacitance: 70,
      powerDemandInputs: [
        {
          input1: 462,
          input2: 0.8
        },
        {
          input1: 528,
          input2: 0.8
        },
        {
          input1: 492,
          input2: 0.8
        },
        {
          input1: 474,
          input2: 0.8
        },
        {
          input1: 499,
          input2: 0.8
        },
        {
          input1: 513,
          input2: 0.8
        },
        {
          input1: 530,
          input2: 0.8
        },
        {
          input1: 523,
          input2: 0.8
        },
        {
          input1: 547,
          input2: 0.8
        },
        {
          input1: 589,
          input2: 0.8
        },
        {
          input1: 621,
          input2: 0.8
        },
        {
          input1: 607,
          input2: 0.8
        },
      ]
    };
  }

  getResetData(): PowerFactorCorrectionInputs {
    return {
      existingDemand: 0,
      currentPowerFactor: 0,
      proposedPowerFactor: 0,
      billedForDemand: 0,
      minimumPowerFactor: 0,
      targetPowerFactor: 0,
      adjustedOrActual: 0,
      marginalCostOfDemand: 0,
      costOfStaticCapacitance: 0,
      costOfDynamicCapacitance: 0,
      powerDemandInputs: [
        {
          input1: 0,
          input2: 0
        },
        {
          input1: 0,
          input2: 0
        },
        {
          input1: 0,
          input2: 0
        },
      ]
    };
  }

  existingApparentPower(data: PowerFactorCorrectionInputs): number {
    return data.existingDemand / data.currentPowerFactor;
  }

  existingReactivePower(data: PowerFactorCorrectionInputs): number {
    return Math.sqrt((this.existingApparentPower(data) * this.existingApparentPower(data)) - (data.existingDemand * data.existingDemand));
  }

  proposedApparentPower(data: PowerFactorCorrectionInputs): number {
    return data.existingDemand / data.proposedPowerFactor;
  }

  proposedReactivePower(data: PowerFactorCorrectionInputs): number {
    return Math.sqrt((this.proposedApparentPower(data) * this.proposedApparentPower(data)) - (data.existingDemand * data.existingDemand));
  }

  capacitancePowerRequired(data: PowerFactorCorrectionInputs): number {
    return this.existingReactivePower(data) - this.proposedReactivePower(data);
  }
}
