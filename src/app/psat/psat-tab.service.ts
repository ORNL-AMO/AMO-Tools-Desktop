import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
@Injectable()
export class PsatTabService {
  modifyConditionsTab: BehaviorSubject<string>;
  stepTab: BehaviorSubject<string>;
  mainTab: BehaviorSubject<string>;
  secondaryTab: BehaviorSubject<string>;
  calcTab: BehaviorSubject<string>;

  //system setup tabs
  stepTabs: Array<string> = [
    'system-basics',
    'pump-fluid',
    'motor',
    'field-data'
  ];

  constructor() {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.secondaryTab = new BehaviorSubject<string>('explore-opportunities');
    this.calcTab = new BehaviorSubject<string>('system-curve');
    this.modifyConditionsTab = new BehaviorSubject<string>('field-data');
    this.stepTab = new BehaviorSubject<string>('system-basics');
  }


  continue() {
    let tmpStepTab: string = this.stepTab.getValue();
    if (tmpStepTab == 'field-data') {
      this.mainTab.next('assessment');
    } else {
      let currentTabIndex: number = _.findIndex(this.stepTabs, function (tab) { return tab == tmpStepTab })
      let nextTab: string = this.stepTabs[currentTabIndex + 1];
      this.stepTab.next(nextTab);
    }
  }

  back() {
    if (this.mainTab.getValue() == 'assessment') {
      this.mainTab.next('system-setup')
    } else {
      let tmpStepTab: string = this.stepTab.getValue();
      let currentTabIndex: number = _.findIndex(this.stepTabs, function (tab) { return tab == tmpStepTab })
      let previusTab: string = this.stepTabs[currentTabIndex - 1];
      this.stepTab.next(previusTab);
    }
  }



}
