import { Injectable } from '@angular/core';
import { TurbineInput } from '../../shared/models/ssmt';
import { SSMTOutput } from '../../shared/models/steam-outputs';

@Injectable()
export class BalanceTurbinesService {
  highPressureToLowPressureTurbineFlow: number;
  highPressureToMediumPressureTurbineFlow: number;
  mediumPressureToLowPressureTurbineModelFlow: number;
  mediumPressureSteamRemaining: number;
  constructor() { }


  balanceTurbines(_turbineInput: TurbineInput, _ssmtOutputData: SSMTOutput, _mediumPressureSteamNeed: number, _lowPressureSteamNeed: number): SSMTOutput {
    this.highPressureToLowPressureTurbineFlow = 0;
    this.highPressureToMediumPressureTurbineFlow = 0;
    this.mediumPressureToLowPressureTurbineModelFlow = 0;

    //balance medium pressure
    // let mediumPressureSteamNeed: number = this.mediumPressureSteamNeed;
    this.mediumPressureSteamRemaining = _mediumPressureSteamNeed;

    //High Pressure to Medium Pressure Turbine
    //check we have a high to medium pressure turbine
    if (_ssmtOutputData.highPressureToMediumPressureTurbine) {
      //balance high pressure to low pressure turbine
      _ssmtOutputData = this.balanceHighPressureToMediumPressure(_ssmtOutputData, _turbineInput, _mediumPressureSteamNeed);
    }

    //High Pressure to Low Pressure Turbine minimum flow
    if (_ssmtOutputData.highPressureToLowPressureTurbine) {
      if (_turbineInput.highToLowTurbine.operationType == 2) {
        this.highPressureToLowPressureTurbineFlow = 0;
      } else {
        this.highPressureToLowPressureTurbineFlow = _turbineInput.highToLowTurbine.operationValue1;
      }
    }

    //Medium Pressure to Low Pressure Turbine minimum flow
    if (_ssmtOutputData.mediumPressureToLowPressureTurbine) {
      if (_turbineInput.mediumToLowTurbine.operationType == 2) {
        this.mediumPressureToLowPressureTurbineModelFlow = 0;
      } else {
        this.mediumPressureToLowPressureTurbineModelFlow = _turbineInput.highToLowTurbine.operationValue1;
      }
    }

    //steam need - (high to low pressure flow + medium to low pressure flow)
    let lowPressureSteamRemaining: number = _lowPressureSteamNeed - (this.highPressureToLowPressureTurbineFlow + this.mediumPressureToLowPressureTurbineModelFlow);
    if (_ssmtOutputData.mediumPressureToLowPressurePrv) {
      //TODO: double check we are using outletMassFlow
      //php uses desuperFluidFlow so does it need to be w/ desuperheating?
      lowPressureSteamRemaining = lowPressureSteamRemaining - _ssmtOutputData.mediumPressureToLowPressurePrv.outletMassFlow;
    }
    //TODO: subtract forced excess steam medium pressure to low pressure from lowPressureSteamRemaining
    //lowPressureSteamRemaining = lowPressureSteamRemaining - forcedExcessSteamMediumPressureToLowPressure
    if (lowPressureSteamRemaining < 0) {
      lowPressureSteamRemaining = 0;
    }

    //Handle High pressure to low pressure variable load
    if (_turbineInput.highToLowTurbine.operationType == 2 || _turbineInput.highToLowTurbine.operationType == 3 || _turbineInput.highToLowTurbine.operationType == 4) {
      //2: high 1: low
      let range: number = _turbineInput.highToLowTurbine.operationValue2 - _turbineInput.highToLowTurbine.operationValue1;
      //I couldn't tell you the logic of why this is happening but this is what the php has..
      if (lowPressureSteamRemaining <= (range) || _turbineInput.highToLowTurbine.operationType == 2) {
        this.highPressureToLowPressureTurbineFlow = lowPressureSteamRemaining + _turbineInput.highToLowTurbine.operationValue1;
        lowPressureSteamRemaining = 0;
      } else {
        this.highPressureToLowPressureTurbineFlow = _turbineInput.highToLowTurbine.operationValue2;
        lowPressureSteamRemaining = lowPressureSteamRemaining - range;
      }
    }
    //TODO: add forced excess steam medium pressure to low pressure from lowPressureSteamRemaining
    // lowPressureSteamRemaining = lowPressureSteamRemaining + forcedExcessSteamMediumPressureToLowPressure
    // if (lowPressureSteamRemaining < forcedExcessSteamMediumPressureToLowPressure) {
    //   lowPressureSteamRemainging = forcedExcessSteamMediumPressureToLowPressure;
    // }

    //Handle Medium Pressure to Low
    if (_turbineInput.mediumToLowTurbine.operationType == 2 || _turbineInput.mediumToLowTurbine.operationType == 3 || _turbineInput.mediumToLowTurbine.operationType == 4) {
      //2: high 1: low
      let range: number = _turbineInput.mediumToLowTurbine.operationValue2 - _turbineInput.mediumToLowTurbine.operationValue1;
      //I couldn't tell you the logic of why this is happening but this is what the php has..
      if (lowPressureSteamRemaining <= (range) || _turbineInput.mediumToLowTurbine.operationType == 2) {
        this.mediumPressureToLowPressureTurbineModelFlow = lowPressureSteamRemaining + _turbineInput.mediumToLowTurbine.operationValue1;
        lowPressureSteamRemaining = 0;
      } else {
        this.mediumPressureToLowPressureTurbineModelFlow = _turbineInput.mediumToLowTurbine.operationValue2;
        lowPressureSteamRemaining = lowPressureSteamRemaining - range;
      }
    }
    //update mass flows
    _ssmtOutputData.highPressureToLowPressureTurbine.massFlow =  this.highPressureToLowPressureTurbineFlow;
    _ssmtOutputData.mediumPressureToLowPressureTurbine.massFlow = this.mediumPressureToLowPressureTurbineModelFlow;
    return _ssmtOutputData;
  }

  balanceHighPressureToMediumPressure(_ssmtOutputData: SSMTOutput, _turbineInput: TurbineInput, _mediumPressureSteamNeed: number): SSMTOutput {
    //set minimum flow
    if (_turbineInput.highToMediumTurbine.operationType == 2) {
      //balanced header
      this.highPressureToMediumPressureTurbineFlow = 0;
    }
    //all else use operationValue1
    else {
      //fixed power rate
      this.highPressureToMediumPressureTurbineFlow = _turbineInput.highToMediumTurbine.operationValue1;
    }

    this.mediumPressureSteamRemaining = _mediumPressureSteamNeed - this.highPressureToMediumPressureTurbineFlow;
    if (this.mediumPressureSteamRemaining < 0) {
      this.mediumPressureSteamRemaining = 0;
    }

    //handle variable load
    if (_turbineInput.highToMediumTurbine.operationType == 2 || _turbineInput.highToMediumTurbine.operationType == 3 || _turbineInput.highToMediumTurbine.operationType == 4) {
      //operationValue2: high
      //operationValue1: low
      let range: number = _turbineInput.highToMediumTurbine.operationValue2 - _turbineInput.highToMediumTurbine.operationValue1;
      //I couldn't tell you the logic of why this is happening but this is what the php has..
      if (this.mediumPressureSteamRemaining <= (range) || _turbineInput.highToMediumTurbine.operationType == 2) {
        this.highPressureToMediumPressureTurbineFlow = this.mediumPressureSteamRemaining + _turbineInput.highToMediumTurbine.operationValue1;
        this.mediumPressureSteamRemaining = 0;
      } else {
        this.highPressureToMediumPressureTurbineFlow = _turbineInput.highToMediumTurbine.operationValue2;
        this.mediumPressureSteamRemaining = this.mediumPressureSteamRemaining - range;
      }
    }
    //update the mass flow
    _ssmtOutputData.highPressureToMediumPressureTurbine.massFlow = this.highPressureToMediumPressureTurbineFlow;
    return _ssmtOutputData;
  }
}
