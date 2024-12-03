import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SurveyModalService {

  showSurveyModal: BehaviorSubject<boolean>;
  constructor() {
    this.showSurveyModal = new BehaviorSubject<boolean>(undefined);
   }
}
