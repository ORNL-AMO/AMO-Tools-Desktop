import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { UntypedFormGroup } from '@angular/forms';
import { GasLeakageCompareService } from '../../gas-leakage-losses/gas-leakage-compare.service';
import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';
import { Subscription } from 'rxjs';
import { LeakageFormService, LeakageWarnings } from '../../../../calculator/furnaces/leakage/leakage-form.service';


@Component({
    selector: 'app-gas-leakage-tab',
    templateUrl: './gas-leakage-tab.component.html',
    styleUrls: ['./gas-leakage-tab.component.css'],
    standalone: false
})
export class GasLeakageTabComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  inSetup: boolean;

  badgeHover: boolean;
  displayTooltip: boolean;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string> = [];
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private leakageFormService: LeakageFormService, private gasLeakageCompareService: GasLeakageCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      let dataCheck: { missingData: boolean, hasWarning: boolean } = this.checkLossData();
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

  setNumLosses() {
    if (this.phast.losses) {
      if (this.phast.losses.leakageLosses) {
        this.numLosses = this.phast.losses.leakageLosses.length;
      }
    }
  }
  checkLossData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.gasLeakageCompareService.baselineLeakageLoss) {
      this.gasLeakageCompareService.baselineLeakageLoss.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: LeakageWarnings = this.leakageFormService.checkLeakageWarnings(loss);
        let tmpHasWarning: boolean = this.leakageFormService.checkWarningsExist(warnings);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    if (this.gasLeakageCompareService.modifiedLeakageLoss && !this.inSetup) {
      this.gasLeakageCompareService.modifiedLeakageLoss.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: LeakageWarnings = this.leakageFormService.checkLeakageWarnings(loss);
        let tmpHasWarning: boolean = this.leakageFormService.checkWarningsExist(warnings);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }


  checkLossValid(loss: LeakageLoss) {
      let tmpForm: UntypedFormGroup = this.leakageFormService.initFormFromLoss(loss);
      if (tmpForm.status === 'VALID') {
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
