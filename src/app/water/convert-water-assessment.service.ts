import { Injectable } from '@angular/core';
import { Modification, WaterAssessment } from '../shared/models/water-assessment';
import { Settings } from '../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class ConvertWaterAssessmentService {

  constructor() { }

  convertWaterAssessment(waterAssessment: WaterAssessment, oldSettings: Settings, newSettings: Settings): WaterAssessment {
    waterAssessment = this.convertWaterAssessmentData(waterAssessment, oldSettings, newSettings);
    if (waterAssessment.modifications) {
      waterAssessment.modifications.forEach(modification => {
        modification = this.convertModification(modification, oldSettings, newSettings);
      });
    }
    return waterAssessment;
  }

  convertWaterAssessmentData(waterAssessment: WaterAssessment, oldSettings: Settings, newSettings: Settings): WaterAssessment {
    return waterAssessment;
  }

  convertModification(waterAssessment: Modification, oldSettings: Settings, newSettings: Settings): Modification {
    return waterAssessment;
  }
}
