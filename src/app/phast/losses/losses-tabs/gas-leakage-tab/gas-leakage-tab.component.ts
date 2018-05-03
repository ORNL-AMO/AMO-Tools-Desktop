import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { GasLeakageLossesService } from '../../gas-leakage-losses/gas-leakage-losses.service';
import { GasLeakageCompareService } from '../../gas-leakage-losses/gas-leakage-compare.service';
import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-gas-leakage-tab',
  templateUrl: './gas-leakage-tab.component.html',
  styleUrls: ['./gas-leakage-tab.component.css']
})
export class GasLeakageTabComponent implements OnInit {
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
  constructor(private lossesService: LossesService, private gasLeakageLossesService: GasLeakageLossesService, private gasLeakageCompareService: GasLeakageCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.compareSubscription = this.gasLeakageCompareService.inputError.subscribe(val => {
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

  setNumLosses() {
    if (this.phast.losses) {
      if (this.phast.losses.leakageLosses) {
        this.numLosses = this.phast.losses.leakageLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.gasLeakageCompareService.baselineLeakageLoss) {
      this.gasLeakageCompareService.baselineLeakageLoss.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.gasLeakageCompareService.modifiedLeakageLoss) {
      this.gasLeakageCompareService.modifiedLeakageLoss.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: LeakageLoss) {
      let tmpForm: FormGroup = this.gasLeakageLossesService.initFormFromLoss(loss);
      if (tmpForm.status == 'VALID') {
        return true;
      } else {
        return false;
      }
  }

  checkDifferent() {
    if (this.gasLeakageCompareService.baselineLeakageLoss && this.gasLeakageCompareService.modifiedLeakageLoss) {
      return this.gasLeakageCompareService.compareAllLosses();
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
