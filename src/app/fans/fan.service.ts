import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  FanRatedInfo, TraverseRectangular, TraverseCircular, PlaneDataRectangular, PlaneDataCircular, BaseGasDensity,
  FanShaftPower, Fan203Results, Fan203Inputs
} from '../shared/models/fans';

declare var fanAddon: any;

// import { Settings } from '../shared/models/settings';
// import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
// import { ValidationService } from '../shared/validation.service';
// import { BehaviorSubject } from 'rxjs';
// import { FormGroup } from '@angular/forms';

class Fan203 {
  protected fan203Input: Fan203Inputs;
  protected fan203Results: Fan203Results;

  protected constructor (fanRatedInfo: FanRatedInfo, baseGasDensity: BaseGasDensity, fanShaftPower: FanShaftPower) {
    this.fan203Input = {
      FanRatedInfo: fanRatedInfo,
      BaseGasDensity: baseGasDensity,
      FanShaftPower: fanShaftPower
    };
  }

  protected calculate() {
    this.fan203Results = fanAddon.fan203(this.fan203Input);
  }

  public setFanRatedInfo(fanRatedInfo: FanRatedInfo) {
    this.fan203Input.FanRatedInfo = fanRatedInfo;
  }

  public setBaseGasDensity(baseGasDensity: BaseGasDensity) {
    this.fan203Input.BaseGasDensity = baseGasDensity;
  }

  public setFanShaftPower(fanShaftPower: FanShaftPower) {
    this.fan203Input.FanShaftPower = fanShaftPower;
  }

  public getResults() {
    this.calculate();
    return this.fan203Results;
  }
}

@Injectable()
export class Fan203Rectangular extends Fan203 {
  public constructor (fanRatedInfo: FanRatedInfo, planeDataRectangular: PlaneDataRectangular, baseGasDensity: BaseGasDensity, fanShaftPower: FanShaftPower) {
    super(fanRatedInfo, baseGasDensity, fanShaftPower);
    this.fan203Input.PlaneData = planeDataRectangular;
  }

  public setFlowTraverse(flowTraverse: TraverseRectangular) {
    this.fan203Input.PlaneData.FlowTraverse = flowTraverse;
  }
}

@Injectable()
export class Fan203Circular extends Fan203 {
  public constructor (fanRatedInfo: FanRatedInfo, planeDataCircular: PlaneDataCircular, baseGasDensity: BaseGasDensity, fanShaftPower: FanShaftPower) {
    super(fanRatedInfo, baseGasDensity, fanShaftPower);
    this.fan203Input.PlaneData = planeDataCircular;
  }

  public setFlowTraverse(flowTraverse: TraverseCircular) {
    this.fan203Input.PlaneData.FlowTraverse = flowTraverse;
  }
}

// this would work just fine
// class Hello {
//   hi(fanRatedInfo: FanRatedInfo, planeDataCircular: PlaneDataCircular, baseGasDensity: BaseGasDensity, fanShaftPower: FanShaftPower) {
//     const fan = new Fan203Circular(fanRatedInfo, planeDataCircular, baseGasDensity, fanShaftPower);
//     const yes = fan.getResults();
//   }
// }
