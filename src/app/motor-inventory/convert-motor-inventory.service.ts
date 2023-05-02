import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { BatchAnalysisData, MotorInventoryData, NameplateData, TorqueData } from './motor-inventory';
import { Settings } from '../shared/models/settings';

@Injectable()
export class ConvertMotorInventoryService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertInventoryData(motorInventoryData: MotorInventoryData, oldSettings: Settings, newSettings: Settings): MotorInventoryData {
    motorInventoryData.departments.forEach(department => {
      department.catalog.forEach(motorItem => {
        motorItem.nameplateData = this.convertNameplateData(motorItem.nameplateData, oldSettings, newSettings);
        motorItem.batchAnalysisData = this.convertBatchAnalysisData(motorItem.batchAnalysisData, oldSettings, newSettings);
        motorItem.torqueData = this.convertTorqueData(motorItem.torqueData, oldSettings, newSettings);
      });
    });
    return motorInventoryData;
  }


  convertNameplateData(nameplateData: NameplateData, oldSettings: Settings, newSettings: Settings): NameplateData {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      nameplateData.ratedMotorPower = this.convertUnitsService.value(nameplateData.ratedMotorPower).from('kW').to('hp');
      nameplateData.weight = this.convertUnitsService.value(nameplateData.weight).from('kg').to('lb');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      nameplateData.ratedMotorPower = this.convertUnitsService.value(nameplateData.ratedMotorPower).from('hp').to('kW');
      nameplateData.weight = this.convertUnitsService.value(nameplateData.weight).from('lb').to('kg');
    }
    nameplateData.ratedMotorPower = this.convertUnitsService.roundVal(nameplateData.ratedMotorPower, 2);
    nameplateData.weight = this.convertUnitsService.roundVal(nameplateData.weight, 2);
    return nameplateData;
  }

  convertBatchAnalysisData(batchAnalysisData: BatchAnalysisData, oldSettings: Settings, newSettings: Settings): BatchAnalysisData {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      batchAnalysisData.modifiedPower = this.convertUnitsService.value(batchAnalysisData.modifiedPower).from('kW').to('hp');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      batchAnalysisData.modifiedPower = this.convertUnitsService.value(batchAnalysisData.modifiedPower).from('hp').to('kW');
    }
    batchAnalysisData.modifiedPower = this.convertUnitsService.roundVal(batchAnalysisData.modifiedPower, 2);
    return batchAnalysisData;
  }

  convertTorqueData(torqueData: TorqueData, oldSettings: Settings, newSettings: Settings): TorqueData {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      torqueData.torqueFullLoad = this.convertUnitsService.value(torqueData.torqueFullLoad).from('Nm').to('lbft');
      torqueData.torqueBreakDown = this.convertUnitsService.value(torqueData.torqueBreakDown).from('Nm').to('lbft');
      torqueData.torqueLockedRotor = this.convertUnitsService.value(torqueData.torqueLockedRotor).from('Nm').to('lbft');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      torqueData.torqueFullLoad = this.convertUnitsService.value(torqueData.torqueFullLoad).from('lbft').to('Nm');
      torqueData.torqueBreakDown = this.convertUnitsService.value(torqueData.torqueBreakDown).from('lbft').to('Nm');
      torqueData.torqueLockedRotor = this.convertUnitsService.value(torqueData.torqueLockedRotor).from('lbft').to('Nm');
    }
    torqueData.torqueFullLoad = this.convertUnitsService.roundVal(torqueData.torqueFullLoad, 2);
    torqueData.torqueBreakDown = this.convertUnitsService.roundVal(torqueData.torqueBreakDown, 2);
    torqueData.torqueLockedRotor = this.convertUnitsService.roundVal(torqueData.torqueLockedRotor, 2);
    return torqueData;
  }


}