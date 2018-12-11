import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ExploreOpportunitiesService {
  currentField: BehaviorSubject<string>;
  currentTab: BehaviorSubject<string>;
  constructor() { 
    this.currentField = new BehaviorSubject<string>('default');
    this.currentTab = new BehaviorSubject<string>('none');
  }
}
