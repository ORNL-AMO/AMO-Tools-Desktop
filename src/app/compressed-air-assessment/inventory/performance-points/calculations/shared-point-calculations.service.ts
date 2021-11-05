import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';

@Injectable()
export class SharedPointCalculationsService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  calculateAirFlow(capacity: number, pointPressure: number, potentialPressure: number, atmosphericPressure: number, settings: Settings): number {
    let maxFullFlowAirFlow: number;
    if (settings.unitsOfMeasure == 'Metric') {
      atmosphericPressure = this.convertUnitsService.value(atmosphericPressure).from('kPaa').to('psia');
      capacity = this.convertUnitsService.value(capacity).from('m3/min').to('ft3/min');
      pointPressure = this.convertUnitsService.value(pointPressure).from('barg').to('psig');
      potentialPressure = this.convertUnitsService.value(potentialPressure).from('barg').to('psig');
      maxFullFlowAirFlow = (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * capacity * (1 - 0.00075 * (pointPressure - potentialPressure));
      maxFullFlowAirFlow = this.convertUnitsService.value(maxFullFlowAirFlow).from('ft3/min').to('m3/min');
    } else {
      maxFullFlowAirFlow = (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * capacity * (1 - 0.00075 * (pointPressure - potentialPressure));
    }

    return maxFullFlowAirFlow;
  }

  calculatePower(compressorType: number, inputPressure: number, performancePointPressure: number, ratedFullLoadOperatingPressure: number, TotPackageInputPower: number, atmosphericPressure: number, settings: Settings): number {
    let polytropicExponent: number = (1.4 - 1) / 1.4;
    let p1: number;
    let p2: number;
    if (settings.unitsOfMeasure == 'Metric') {
      atmosphericPressure = this.convertUnitsService.value(atmosphericPressure).from('kPaa').to('psia');
      inputPressure = this.convertUnitsService.value(inputPressure).from('barg').to('psig');
      performancePointPressure = this.convertUnitsService.value(performancePointPressure).from('barg').to('psig');
      ratedFullLoadOperatingPressure = this.convertUnitsService.value(ratedFullLoadOperatingPressure).from('barg').to('psig');
    }

    if (compressorType == 1 || compressorType == 2 || compressorType == 3) {
      //screw
      p1 = -.0000577 * Math.pow(atmosphericPressure, 3) + 0.000251 * Math.pow(atmosphericPressure, 2) + .0466 * atmosphericPressure + .4442;
      p2 = (performancePointPressure + inputPressure) / inputPressure;
    } else {
      p1 = (atmosphericPressure / inputPressure);
      p2 = (performancePointPressure + atmosphericPressure) / atmosphericPressure;
    }
    let p3: number = Math.pow(((ratedFullLoadOperatingPressure + inputPressure) / inputPressure), polytropicExponent) - 1;
    let maxFullFlowPower: number = p1 * (Math.pow(p2, polytropicExponent) - 1) / p3 * TotPackageInputPower;
    return maxFullFlowPower;
  }
}
