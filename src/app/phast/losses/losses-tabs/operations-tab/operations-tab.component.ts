import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';

import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { OperationsService, OperationsWarnings } from '../../operations/operations.service';
import { OperationsCompareService } from '../../operations/operations-compare.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';


@Component({
  selector: 'app-operations-tab',
  templateUrl: './operations-tab.component.html',
  styleUrls: ['./operations-tab.component.css']
})
export class OperationsTabComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  inSetup: boolean;
  @Input()
  settings: Settings;

  badgeHover: boolean;
  displayTooltip: boolean;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string> = [];
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private operationsService: OperationsService, private operationsCompareService: OperationsCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      let dataCheck: { missingData: boolean, hasWarning: boolean } = this.checkData();
      this.missingData = dataCheck.missingData;
      this.isDifferent = this.checkDifferent();
      this.inputError = dataCheck.hasWarning;
      this.setBadgeClass();
    });
    this.badgeHover = false;
  }

  ngOnDestroy() {
    this.lossSubscription.unsubscribe();
  }

  setBadgeClass() {
    let badgeStr: Array<string> = ['success'];
    if (this.missingData) {
      badgeStr = ['missing-data'];
    }else if (this.inputError) {
      badgeStr = ['input-error'];
    }else if (this.isDifferent && !this.inSetup) {
      badgeStr = ['loss-different'];
    }
    this.badgeClass = badgeStr;
    this.cd.detectChanges();
  }

  checkData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.operationsCompareService.baseline) {
      if (this.checkLossValid(this.operationsCompareService.baseline, this.settings) === false) {
        missingData = true;
      }
      let warnings: OperationsWarnings = this.operationsService.checkWarnings(this.operationsCompareService.baseline.operatingHours);
      let tmpHasWarning: boolean = this.operationsService.checkWarningsExist(warnings);
      if (tmpHasWarning === true) {
        hasWarning = tmpHasWarning;
      }
    }
    if (this.operationsCompareService.modification) {
      if (this.checkLossValid(this.operationsCompareService.modification, this.settings) === false) {
        missingData = true;
      }
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }


  checkLossValid(phast: PHAST, settings: Settings) {
    let tmpForm: FormGroup = this.operationsService.initForm(phast, settings);
    if (tmpForm.status === 'VALID') {
      return true;
    } else {
      return false;
    }
  }

  checkDifferent() {
    if (this.operationsCompareService.baseline && this.operationsCompareService.modification) {
      return this.operationsCompareService.compareAllLosses();
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
