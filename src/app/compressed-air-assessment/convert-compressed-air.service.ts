import { Injectable } from '@angular/core';

@Injectable()
export class ConvertCompressedAirService {

  constructor() { }

  roundPressureForPresentation(dischargePressure: number) {
    dischargePressure = this.roundVal(dischargePressure, 1);
    return dischargePressure;
  }

  roundAirFlowForPresentation(airflow: number) {
    airflow = this.roundVal(airflow, 0);
    return airflow;
  }

  roundPowerForPresentation(power: number) {
    power = this.roundVal(power, 1);
    return power;
  }

  roundVal(val: number, digits: number) {
    return Number((Math.round(val * 100) / 100).toFixed(digits));
  }
}
