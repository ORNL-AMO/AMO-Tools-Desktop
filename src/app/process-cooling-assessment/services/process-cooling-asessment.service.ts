import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';

@Injectable({
  providedIn: 'root'
})
export class ProcessCoolingAssessmentService {
  private readonly assessment = new BehaviorSubject<Assessment>(undefined);
  readonly assessment$ = this.assessment.asObservable();

  constructor() {
  }

   setAssessment(assessment: Assessment) {
    debugger;
    this.assessment.next(assessment);
  }

  readonly isBaselineValid$ = this.assessment$.pipe(
    map((assessment: Assessment) => assessment ? assessment.processCooling.setupDone : false)
  );

}