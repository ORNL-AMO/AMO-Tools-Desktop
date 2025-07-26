import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProcessCoolingAssessment } from '../shared/models/process-cooling-assessment';
import { Settings } from '../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingAssessmentService {

  settings: BehaviorSubject<Settings>;
  processCooling: BehaviorSubject<ProcessCoolingAssessment>;
  constructor() {
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.processCooling = new BehaviorSubject<ProcessCoolingAssessment>(undefined);
  }

  updateProcessCooling(assessment: ProcessCoolingAssessment, isBaselineChange: boolean) {
    if (isBaselineChange) {
      this.setIsSetupDone(assessment)  
    }
    this.processCooling.next(assessment);
  }

  setIsSetupDone(assessment: ProcessCoolingAssessment) {
    // let settings: Settings = this.settings.getValue();
    // let hasValidSystemInformation = this.systemInformationFormService.getFormFromObj(assessment.systemInformation, settings).valid;
    let hasValidSystemSetup = true;
    let hasValidInventory = true;
    assessment.setupDone = hasValidSystemSetup && hasValidInventory;
  }

}