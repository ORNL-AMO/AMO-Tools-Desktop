import { Injectable } from '@angular/core';
import { CompressorInventoryItem, PerformancePoint, PerformancePoints } from '../../../../shared/models/compressed-air-assessment';
import { GenericCompressor } from '../../../generic-compressor-db.service';
import * as regression from 'regression';

@Injectable()
export class FullLoadCalculationsService {

  constructor() { }

  setFullLoad(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
    selectedCompressor.performancePoints.fullLoad.dischargePressure = this.getFullLoadDischargePressure(selectedCompressor, selectedCompressor.performancePoints.fullLoad.isDefaultPressure);
    selectedCompressor.performancePoints.fullLoad.airflow = this.getFullLoadAirFlow(selectedCompressor, selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow);
    selectedCompressor.performancePoints.fullLoad.power = this.getFullLoadPower(selectedCompressor, genericCompressor, selectedCompressor.performancePoints.fullLoad.isDefaultPower);
    return selectedCompressor.performancePoints.fullLoad;
  }

  getFullLoadDischargePressure(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
      if (selectedCompressor.nameplateData.compressorType == 6) {
        //centrifugal
        return selectedCompressor.nameplateData.fullLoadOperatingPressure;
      } else {
        return selectedCompressor.nameplateData.fullLoadOperatingPressure;
      }
    } else {
      return selectedCompressor.performancePoints.fullLoad.dischargePressure;
    }
  }

  getFullLoadAirFlow(selectedCompressor: CompressorInventoryItem, isDefault: boolean): number {
    if (isDefault) {
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
        return regressionValue[1];
      }else{
        return selectedCompressor.nameplateData.fullLoadRatedCapacity;
      }
    } else {
      return selectedCompressor.performancePoints.fullLoad.airflow;
    }
  }

  getFullLoadPower(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor, isDefault: boolean): number {
    if (isDefault) {
      return genericCompressor.TotPackageInputPower;
    } else {
      return selectedCompressor.performancePoints.fullLoad.power;
    }
  }


  // setCentrifugalFullLoadPerformancePoint(selectedCompressor: CompressorInventoryItem, genericCompressor: GenericCompressor): PerformancePoint {
  //   //y1 = MaxPressSurgeFlow, x1 = MaxSurgePressure
  //   //y2 = RatedCapacity, x2 = RatedPressure
  //   //y3 = MinPressureStonewallFlow, x3 = MinStonewallPressure
  //   let regressionData: Array<Array<number>> = [
  //     [selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity],
  //     [selectedCompressor.nameplateData.fullLoadOperatingPressure, selectedCompressor.nameplateData.fullLoadRatedCapacity],
  //     [selectedCompressor.centrifugalSpecifics.minFullLoadPressure, selectedCompressor.centrifugalSpecifics.minFullLoadCapacity]
  //   ];
  //   let regressionEquation;
  //   if (selectedCompressor.performancePoints.fullLoad.isDefaultPressure) {
  //     selectedCompressor.performancePoints.fullLoad.dischargePressure = selectedCompressor.nameplateData.fullLoadOperatingPressure;
  //   }
  //   if (selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow) {
  //     regressionEquation = regression.polynomial(regressionData, { order: 2, precision: 50 });
  //     let regressionValue = regressionEquation.predict(selectedCompressor.performancePoints.fullLoad.dischargePressure);
  //     selectedCompressor.performancePoints.fullLoad.airflow = regressionValue[1];
  //   }
  //   if (selectedCompressor.performancePoints.fullLoad.isDefaultPower) {
  //     selectedCompressor.performancePoints.fullLoad.power = genericCompressor.TotPackageInputPower;
  //   }
  //   return selectedCompressor.performancePoints.fullLoad;
  // }
}
