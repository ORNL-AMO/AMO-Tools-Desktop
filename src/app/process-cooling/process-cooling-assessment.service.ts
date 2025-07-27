import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProcessCoolingAssessment } from '../shared/models/process-cooling-assessment';
import { Settings } from '../shared/models/settings';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { Assessment } from '../shared/models/assessment';

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingAssessmentService {

  settings: BehaviorSubject<Settings>;
  processCooling: BehaviorSubject<ProcessCoolingAssessment>;

  private readonly assessment = new BehaviorSubject<Assessment>(undefined);
  readonly assessment$ = this.assessment.asObservable();

  constructor(private assessmentDbService: AssessmentDbService) {

    this.settings = new BehaviorSubject<Settings>(undefined);
    this.processCooling = new BehaviorSubject<ProcessCoolingAssessment>(undefined);
  }

   setAssessment(assessment: Assessment) {
    this.assessment.next(assessment);
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