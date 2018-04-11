import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';

import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { OperationsService } from '../../operations/operations.service';
import { OperationsCompareService } from '../../operations/operations-compare.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-operations-tab',
  templateUrl: './operations-tab.component.html',
  styleUrls: ['./operations-tab.component.css']
})
export class OperationsTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  badgeHover: boolean;
  displayTooltip: boolean;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  compareSubscription: Subscription;
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private operationsService: OperationsService, private operationsCompareService: OperationsCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.compareSubscription = this.operationsCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })

    this.badgeHover = false;
  }

  ngOnDestroy(){
    this.compareSubscription.unsubscribe();
    this.lossSubscription.unsubscribe();
  }

  setBadgeClass(){
    let badgeStr: Array<string> = ['success'];
    if(this.missingData){
      badgeStr = ['missing-data'];
    }else if(this.inputError){
      badgeStr = ['input-error'];
    }else if(this.isDifferent){
      badgeStr = ['loss-different'];
    }
    this.badgeClass = badgeStr;
    this.cd.detectChanges();
  }

  checkMissingData(): boolean {
    let testVal = false;
    if (this.operationsCompareService.baseline) {
      if (this.checkLossValid(this.operationsCompareService.baseline) == false) {
        testVal = true;
      }
    }
    if (this.operationsCompareService.modification) {
      if (this.checkLossValid(this.operationsCompareService.modification) == false) {
        testVal = true;
      }
    }
    return testVal;
  }


  checkLossValid(phast: PHAST) {
    let tmpForm: FormGroup = this.operationsService.initForm(phast);
    if (tmpForm.status == 'VALID') {
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
