import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';

@Injectable()
export class ProcessCoolingAssessmentService {
  private readonly assessment = new BehaviorSubject<Assessment>(undefined);
  readonly assessment$ = this.assessment.asObservable();

  constructor() {
  }

  setAssessment(assessment: Assessment) {
    this.assessment.next(assessment);
  }

  readonly isBaselineValid$ = this.assessment$.pipe(
    map((assessment: Assessment) => assessment ? assessment.processCooling.setupDone : false)
  );

  get assessmentId(): number | undefined {
    const assessment = this.assessment.getValue();
    return assessment ? assessment.id : undefined;
  }

  isSystemInformationValid(): boolean {
    return true;
  }
  isChillerInventoryValid(): boolean {
    return true;
  }
}