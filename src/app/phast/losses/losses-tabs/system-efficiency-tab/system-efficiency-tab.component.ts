import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { HeatSystemEfficiencyCompareService } from '../../heat-system-efficiency/heat-system-efficiency-compare.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-system-efficiency-tab',
    templateUrl: './system-efficiency-tab.component.html',
    styleUrls: ['./system-efficiency-tab.component.css'],
    standalone: false
})
export class SystemEfficiencyTabComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  inSetup: boolean;

  badgeHover: boolean;
  displayTooltip: boolean;

  numLosses: number = 0;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string> = [];
  efficiencyDone: boolean;
  lossSubscription: Subscription;

  constructor(private lossesService: LossesService, private heatSystemEfficiencyCompareService: HeatSystemEfficiencyCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.efficiencyDone = this.lossesService.efficiencyDone;
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    });

    this.badgeHover = false;
  }

  ngOnDestroy() {
    this.lossSubscription.unsubscribe();
  }

  setBadgeClass() {
    let badgeStr: Array<string> = ['success'];
    if (this.missingData || !this.efficiencyDone) {
      badgeStr = ['missing-data'];
    } else if (this.isDifferent && !this.inSetup) {
      badgeStr = ['loss-different'];
    }
    this.badgeClass = badgeStr;
    this.cd.detectChanges();
  }

  setNumLosses() {
    if (this.phast.losses) {
      if (this.phast.systemEfficiency) {
        this.numLosses = 1;
      } else {
        this.numLosses = 0;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.heatSystemEfficiencyCompareService.baseline) {
      if (!this.heatSystemEfficiencyCompareService.baseline.systemEfficiency) {
        testVal = true;
      }
    }
    if (this.heatSystemEfficiencyCompareService.modification && !this.inSetup) {
      if (!this.heatSystemEfficiencyCompareService.modification.systemEfficiency) {
        testVal = true;
      }
    }
    return testVal;
  }

  checkDifferent() {
    if (this.heatSystemEfficiencyCompareService.baseline && this.heatSystemEfficiencyCompareService.modification) {
      return this.heatSystemEfficiencyCompareService.compareEfficiency();
    }
  }

  showTooltip() {
    this.badgeHover = true;

    setTimeout(() => {
      this.checkHover();
    }, 1000);
  }

  hideTooltip() {
    this.badgeHover = false;
    this.displayTooltip = false;
  }

  checkHover() {
    if (this.badgeHover) {
      this.displayTooltip = true;
    }
    else {
      this.displayTooltip = false;
    }
  }
}
