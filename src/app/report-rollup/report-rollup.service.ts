import { Injectable } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ReportRollupService {

  psats: BehaviorSubject<Array<Assessment>>;
  phasts: BehaviorSubject<Array<Assessment>>;

  constructor() { 
    this.psats = new BehaviorSubject<Array<Assessment>>(new Array<Assessment>())
    this.phasts = new BehaviorSubject<Array<Assessment>>(new Array<Assessment>())
  }

}
