import { Injectable } from '@angular/core';
import { FanEfficiencyInputs } from './fan-efficiency/fan-efficiency.component';

@Injectable()
export class FanService {

  fanEfficiencyInputs:FanEfficiencyInputs = {
    fanType: undefined,
    fanSpeed: undefined,
    flowRate: undefined,
    inletPressure: undefined,
    outletPressure: undefined,
    compressibility: undefined
  };
  constructor() { }
}
