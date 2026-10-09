import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { PSAT_STEPPED_ROUTES, SteppedRoute } from './routing/stepped-routes';
@Injectable()
export class PsatTabService {
  private router = inject(Router);
  private steppedRoutes: SteppedRoute[] = inject(PSAT_STEPPED_ROUTES);

  modifyConditionsTab: BehaviorSubject<string>;
  stepTab: BehaviorSubject<string>;
  mainTab: BehaviorSubject<string>;
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
      this.goToMainTab('assessment');
    } else {
      let currentTabIndex: number = _.findIndex(this.stepTabs, function (tab) { return tab == tmpStepTab })
      let nextTab: string = this.stepTabs[currentTabIndex + 1];
      this.stepTab.next(nextTab);
    }
  }

  back() {
    if (this.mainTab.getValue() == 'assessment') {
      this.goToMainTab('baseline');
    } else {
      let tmpStepTab: string = this.stepTab.getValue();
      let currentTabIndex: number = _.findIndex(this.stepTabs, function (tab) { return tab == tmpStepTab })
      let previusTab: string = this.stepTabs[currentTabIndex - 1];
      this.stepTab.next(previusTab);
    }
  }

  /**
   * Main tab changes are navigations; PsatComponent syncs mainTab from the resulting route.
   * @param tab Main tab route path
   */
  goToMainTab(tab: string) {
    if (this.assessmentId) {
      this.router.navigate(['/psat', this.assessmentId, tab]);
    }
  }

  continueMainTab() {
    const currentIndex: number = this.steppedRoutes.findIndex(route => route.view === this.mainTab.getValue());
    const nextRoute: SteppedRoute = this.steppedRoutes[currentIndex + 1];
    if (nextRoute) {
      this.goToMainTab(nextRoute.path);
    }
  }

  backMainTab() {
    const currentIndex: number = this.steppedRoutes.findIndex(route => route.view === this.mainTab.getValue());
    const previousRoute: SteppedRoute = this.steppedRoutes[currentIndex - 1];
    if (previousRoute) {
      this.goToMainTab(previousRoute.path);
    }
  }

}
