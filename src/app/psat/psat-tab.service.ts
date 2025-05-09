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
  showExportModal: BehaviorSubject<boolean>;

  //baseline tabs
  stepTabs: Array<string> = [
    'baseline',
    'operations',
    'pump-fluid',
    'motor',
    'field-data'
  ];

  constructor() {
    this.mainTab = new BehaviorSubject<string>('baseline');
    this.secondaryTab = new BehaviorSubject<string>('explore-opportunities');
    this.calcTab = new BehaviorSubject<string>('achievable-efficiency');
    this.modifyConditionsTab = new BehaviorSubject<string>('pump-fluid');
    this.stepTab = new BehaviorSubject<string>('baseline');
    this.showExportModal = new BehaviorSubject<boolean>(false);
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
      this.mainTab.next('baseline')
    } else {
      let tmpStepTab: string = this.stepTab.getValue();
      let currentTabIndex: number = _.findIndex(this.stepTabs, function (tab) { return tab == tmpStepTab })
      let previusTab: string = this.stepTabs[currentTabIndex - 1];
      this.stepTab.next(previusTab);
    }
  }



}
