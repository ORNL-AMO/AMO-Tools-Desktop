import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { ActivatedSludgeData, AeratorPerformanceData, WasteWater, WasteWaterData } from '../shared/models/waste-water';

@Injectable()
export class ConvertWasteWaterService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertWasteWater(wasteWater: WasteWater, oldSettings: Settings, newSettings: Settings): WasteWater{
    wasteWater.baselineData = this.convertWasteWaterData(wasteWater.baselineData, oldSettings, newSettings);
    wasteWater.modifications.forEach(modification => {
      modification = this.convertWasteWaterData(modification, oldSettings, newSettings);
    });
    return wasteWater;
  }

  convertWasteWaterData(wasteWaterData: WasteWaterData, oldSettings: Settings, newSettings: Settings): WasteWaterData {
    wasteWaterData.activatedSludgeData = this.convertActivatedSludgeData(wasteWaterData.activatedSludgeData, oldSettings, newSettings);
    wasteWaterData.aeratorPerformanceData = this.convertAeratorPerformanceData(wasteWaterData.aeratorPerformanceData, oldSettings, newSettings);
    return wasteWaterData;
  }

  convertActivatedSludgeData(activatedSludgeData: ActivatedSludgeData, oldSettings: Settings, newSettings: Settings): ActivatedSludgeData {
    //Volume: metric = m3, imperial = Mgal
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      activatedSludgeData.Volume = this.convertUnitsService.value(activatedSludgeData.Volume).from('m3').to('Mgal');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      activatedSludgeData.Volume = this.convertUnitsService.value(activatedSludgeData.Volume).from('Mgal').to('m3');
    }
    activatedSludgeData.Volume = this.convertUnitsService.roundVal(activatedSludgeData.Volume, 2);
    return activatedSludgeData;
  }

  convertAeratorPerformanceData(aeratorPerformanceData: AeratorPerformanceData, oldSettings: Settings, newSettings: Settings): AeratorPerformanceData {
    //SOTR metric = kg/kWh, imperial lb/hr
    //Aeration metric = kW, imperial = hp
    //Elevation metric = m, imperial = ft
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      aeratorPerformanceData.SOTR = this.convertUnitsService.value(aeratorPerformanceData.SOTR).from('kgkw').to('lbhp');
      aeratorPerformanceData.Aeration = this.convertUnitsService.value(aeratorPerformanceData.Aeration).from('kW').to('hp');
      aeratorPerformanceData.Elevation = this.convertUnitsService.value(aeratorPerformanceData.Elevation).from('m').to('ft');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      aeratorPerformanceData.SOTR = this.convertUnitsService.value(aeratorPerformanceData.SOTR).from('lbhp').to('kgkw');
      aeratorPerformanceData.Aeration = this.convertUnitsService.value(aeratorPerformanceData.Aeration).from('hp').to('kW');
      aeratorPerformanceData.Elevation = this.convertUnitsService.value(aeratorPerformanceData.Elevation).from('ft').to('m');
    }
    aeratorPerformanceData.SOTR = this.convertUnitsService.roundVal(aeratorPerformanceData.SOTR, 2);
    aeratorPerformanceData.Aeration = this.convertUnitsService.roundVal(aeratorPerformanceData.Aeration, 2);
    aeratorPerformanceData.Elevation = this.convertUnitsService.roundVal(aeratorPerformanceData.Elevation, 2);
    return aeratorPerformanceData;
  }


}
