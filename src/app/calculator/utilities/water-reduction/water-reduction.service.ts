import { Injectable } from '@angular/core';
import { WaterReductionData, VolumeMeterMethodData, MeteredFlowMethodData, BucketMethodData, WaterOtherMethodData } from '../../../shared/models/standalone';
import { FormBuilder } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class WaterReductionService {

  baselineData: Array<WaterReductionData>;
  modificationData: Array<WaterReductionData>;

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }

  initObject(index: number, settings: Settings, isWastewater: boolean, operatingHours: OperatingHours): WaterReductionData {
    let defaultVolumeMeterMethodData: VolumeMeterMethodData = {
      initialMeterReading: 4235,
      finalMeterReading: 5842,
      elapsedTime: 15
    };
    let defaultMeteredFlowMethod: MeteredFlowMethodData = {
      meterReading: 100
    };
    let defaultBucketMethodData: BucketMethodData = {
      bucketVolume: 10,
      bucketFillTime: 20
    };
    let defaultOtherMethodData: WaterOtherMethodData = {
      consumption: 15000
    };

    let hoursPerYear: number = 8736;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let waterCost: number = 0.12;
    if (settings) {
      if (isWastewater) {
        waterCost = settings.waterWasteCost;
      }
      else {
        waterCost = settings.waterCost;
      }
    }
    let obj: WaterReductionData = {
      name: 'Equipment #' + (index + 1),
      hoursPerYear: hoursPerYear,
      waterCost: waterCost,
      measurementMethod: 0,
      volumeMeterMethodData: defaultVolumeMeterMethodData,
      meteredFlowMethodData: defaultMeteredFlowMethod,
      bucketMethodData: defaultBucketMethodData,
      otherMethodData: defaultOtherMethodData
    };
    return obj;
  }
}
