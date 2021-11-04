import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import * as regression from 'regression';
import { SharedPointCalculationsService } from './shared-point-calculations.service';
import { ConvertCompressedAirService } from '../../../convert-compressed-air.service';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { Settings } from '../../../../shared/models/settings';

@Injectable()
export class FullLoadCalculationsService {

  constructor(private sharedPointCalculationsService: SharedPointCalculationsService,
    private convertCompressedAirService: ConvertCompressedAirService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  setFullLoad(selectedCompressor: CompressorInventoryItem): PerformancePoint {
    selectedCompressor.performancePoints.fullLoad.dischargePressure = this.getFullLoadDischargePressure(selectedCompressor, selectedCompressor.performancePoints.fullLoad.isDefaultPressure);
    selectedCompressor.performancePoints.fullLoad.airflow = this.getFullLoadAirFlow(selectedCompressor, selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow);
    selectedCompressor.performancePoints.fullLoad.power = this.getFullLoadPower(selectedCompressor, selectedCompressor.performancePoints.fullLoad.isDefaultPower);
    return selectedCompressor.performancePoints.fullLoad;
  }

  getFullLoadDischargePressure(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let settings: Settings = this.compressedAirAssessmentService.settings.getValue();
      return this.convertCompressedAirService.roundPressureForPresentation(selectedCompressor.nameplateData.fullLoadOperatingPressure, settings);
    } else {
      return selectedCompressor.performancePoints.fullLoad.dischargePressure;
    }
  }

  getFullLoadAirFlow(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let defaultAirflow: number;
      if (selectedCompressor.nameplateData.compressorType == 6) {
        //centrifugal
        //y1 = MaxPressSurgeFlow, x1 = MaxSurgePressure
        //y2 = RatedCapacity, x2 = RatedPressure
        //y3 = MinPressureStonewallFlow, x3 = MinStonewallPressure
        let regressionData: Array<Array<number>> = [
          [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity],
          [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity],
          [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity]
        ];
        let regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
        let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.fullLoad.dischargePressure);
        defaultAirflow =  regressionValue[1];
      } else {
        defaultAirflow = this.sharedPointCalculationsService.calculateAirFlow(selectedCompressor.nameplateData.fullLoadRatedCapacity, selectedCompressor.performancePoints.fullLoad.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure);
      }
      let settings: Settings = this.compressedAirAssessmentService.settings.getValue();
      return this.convertCompressedAirService.roundAirFlowForPresentation(defaultAirflow, settings);
    } else {
      return selectedCompressor.performancePoints.fullLoad.airflow;
    }
  }

  getFullLoadPower(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      let defaultPower: number;
      if (selectedCompressor.nameplateData.compressorType == 6) {
        //centrifugal
        defaultPower = selectedCompressor.nameplateData.totalPackageInputPower;
      } else {
        defaultPower = this.sharedPointCalculationsService.calculatePower(selectedCompressor.nameplateData.compressorType, selectedCompressor.designDetails.inputPressure, selectedCompressor.performancePoints.fullLoad.dischargePressure, selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.totalPackageInputPower);
      }
      return this.convertCompressedAirService.roundPowerForPresentation(defaultPower);
    } else {
      return selectedCompressor.performancePoints.fullLoad.power;
    }
  }
}
