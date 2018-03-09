import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Fan203Inputs, BaseGasDensity, PlaneData, Plane } from '../shared/models/fans';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

declare var fanAddon: any;

@Injectable()
export class FsatService {


  mainTab: BehaviorSubject<string>
  stepTab: BehaviorSubject<string>;
  constructor(private convertUnitsService: ConvertUnitsService) {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.stepTab = new BehaviorSubject<string>('system-basics');
  }

  test() {
    console.log(fanAddon);
  }

  fan203(input: Fan203Inputs) {
    let inpCopy: Fan203Inputs = JSON.parse(JSON.stringify(input));
    if (!input.FanShaftPower.isMethodOne) {
      inpCopy.FanShaftPower.motorShaftPower = this.convertUnitsService.value(inpCopy.FanShaftPower.motorShaftPower).from('W').to('hp');
    }
    inpCopy.FanShaftPower.sumSEF = input.PlaneData.inletSEF + input.PlaneData.outletSEF;
    return fanAddon.fan203(inpCopy);
  }

  getBaseGasDensityDewPoint(inputs: BaseGasDensity): number {
    return fanAddon.getBaseGasDensityDewPoint(inputs);
  }

  getBaseGasDensityRelativeHumidity(inputs: BaseGasDensity): number {
    return fanAddon.getBaseGasDensityRelativeHumidity(inputs);
  }

  getBaseGasDensityWetBulb(inputs: BaseGasDensity): number {
    return fanAddon.getBaseGasDensityWetBulb(inputs);
  }

  getVelocityPressureData(inputs: Plane) {
    return fanAddon.getVelocityPressureData(inputs);
  }

  getPlaneResults(input: Fan203Inputs) {
    return fanAddon.getPlaneResults(input);
  }
}

