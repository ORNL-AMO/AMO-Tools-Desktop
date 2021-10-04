import { Injectable } from '@angular/core';
import { CompressedAirAssessment } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';

@Injectable()
export class SharedPointCalculationsService {

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  calculateAirFlow(capacity: number, pointPressure: number, potentialPressure: number): number {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let atmosphericPressure: number = compressedAirAssessment.systemInformation.atmosphericPressure;
    let maxFullFlowAirFlow: number = (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * capacity * (1 - 0.00075 * (pointPressure - potentialPressure));
    return Number(maxFullFlowAirFlow.toFixed(0));
  }

  calculatePower(compressorType: number, inputPressure: number, performancePointPressure: number, ratedFullLoadOperatingPressure: number, TotPackageInputPower: number): number {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let atmosphericPressure: number = compressedAirAssessment.systemInformation.atmosphericPressure;
    let polytropicExponent: number = (1.4 - 1) / 1.4;
    let p1: number;
    let p2: number;
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
    return Number(maxFullFlowPower.toFixed(1));
  }
}
