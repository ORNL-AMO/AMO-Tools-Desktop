import { Injectable } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Injectable({
  providedIn: 'root'
})
export class ConvertProcessCoolingService {

constructor(private convertUnitsService: ConvertUnitsService) { }

  convertProcessCooling(processCoolingAssessment: ProcessCoolingAssessment, oldSettings: Settings, newSettings: Settings): ProcessCoolingAssessment {
    processCoolingAssessment = this.convertProcessCoolingAssessmentData(processCoolingAssessment, oldSettings, newSettings);
    if (processCoolingAssessment.modifications) {
      processCoolingAssessment.modifications.forEach(modification => {
        modification = this.convertModification(modification, oldSettings, newSettings);
      });
    }
    return processCoolingAssessment;
  }

  convertProcessCoolingAssessmentData(processCooling: ProcessCoolingAssessment, oldSettings: Settings, newSettings: Settings): ProcessCoolingAssessment {
    processCooling.systemInformation = this.convertSystemInformation(processCooling.systemInformation, oldSettings, newSettings);
    return processCooling;
  }

  convertSystemInformation(systemInformation, oldSettings: Settings, newSettings: Settings) {
    // if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
    //   systemInformation.atmosphericPressure = this.convertUnitsService.value(systemInformation.atmosphericPressure).from('kPaa').to('psia');
    // } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
    //   systemInformation.atmosphericPressure = this.convertUnitsService.value(systemInformation.atmosphericPressure).from('psia').to('kPaa');
    // }
    // systemInformation.atmosphericPressure = this.convertUnitsService.roundVal(systemInformation.atmosphericPressure, 2);
    // return systemInformation;
  }

   convertModification(modification, oldSettings: Settings, newSettings: Settings) {
      return modification;
    }
  

}
