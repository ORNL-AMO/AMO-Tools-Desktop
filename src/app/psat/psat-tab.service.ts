import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PSAT_MAIN_VIEWS, PsatMainView } from './routing/psat.routing';
import { getSteppedView } from '../shared/main-tab-routing/main-tab-routing';
@Injectable()
export class PsatTabService {
  private router = inject(Router);

  modifyConditionsTab: BehaviorSubject<string>;
  stepTab: BehaviorSubject<string>;
  mainTab: BehaviorSubject<PsatMainView>;
  secondaryTab: BehaviorSubject<string>;
  calcTab: BehaviorSubject<string>;
  showExportModal: BehaviorSubject<boolean>;
  assessmentId: number;

  //baseline tabs
  stepTabs: Array<string> = [
    'baseline',
    'operations',
    'pump-fluid',
    'motor',
    'field-data'
  ];

  constructor() {
    this.mainTab = new BehaviorSubject<PsatMainView>('baseline');
    this.secondaryTab = new BehaviorSubject<string>('explore-opportunities');
    this.calcTab = new BehaviorSubject<string>('achievable-efficiency');
    this.modifyConditionsTab = new BehaviorSubject<string>('pump-fluid');
    this.stepTab = new BehaviorSubject<string>('baseline');
    this.showExportModal = new BehaviorSubject<boolean>(false);
  }


  continue() {
    let tmpStepTab: string = this.stepTab.getValue();
    if (tmpStepTab == 'field-data') {
      this.goToMainTab('assessment');
    } else {
      const nextTab: string = getSteppedView(this.stepTabs, tmpStepTab, 1);
      if (nextTab) {
        this.stepTab.next(nextTab);
      }
    }
  }

  back() {
    if (this.mainTab.getValue() == 'assessment') {
      this.goToMainTab('baseline');
    } else {
      let tmpStepTab: string = this.stepTab.getValue();
      const previousTab: string = getSteppedView(this.stepTabs, tmpStepTab, -1);
      if (previousTab) {
        this.stepTab.next(previousTab);
      }
    }
  }

  /**
   * Main tab changes are navigations; PsatComponent syncs mainTab from the resulting route.
   * @param tab Main tab route path
   */
  goToMainTab(tab: PsatMainView) {
    if (this.assessmentId) {
      this.router.navigate(['/psat', this.assessmentId, tab]);
    }
  }

  continueMainTab() {
    this.stepMainTab(1);
  }

  backMainTab() {
    this.stepMainTab(-1);
  }

  private stepMainTab(offset: number) {
    const view: PsatMainView = getSteppedView(PSAT_MAIN_VIEWS, this.mainTab.getValue(), offset);
    if (view) {
      this.goToMainTab(view);
    }
  }

}
