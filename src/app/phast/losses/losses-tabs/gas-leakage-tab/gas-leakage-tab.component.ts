import { Component, OnInit, Input } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { GasLeakageLossesService } from '../../gas-leakage-losses/gas-leakage-losses.service';
import { GasLeakageCompareService } from '../../gas-leakage-losses/gas-leakage-compare.service';
import { LeakageLoss } from '../../../../shared/models/phast/losses/leakageLoss';


@Component({
  selector: 'app-gas-leakage-tab',
  templateUrl: './gas-leakage-tab.component.html',
  styleUrls: ['./gas-leakage-tab.component.css']
})
export class GasLeakageTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  constructor(private lossesService: LossesService, private gasLeakageLossesService: GasLeakageLossesService, private gasLeakageCompareService: GasLeakageCompareService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.gasLeakageCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })
  }

  setBadgeClass() {
    if (this.missingData) {
      this.badgeClass = ['missing-data'];
    } else if (this.inputError) {
      this.badgeClass = ['input-error'];
    } else if (this.isDifferent) {
      this.badgeClass = ['loss-different'];
    } else {
      this.badgeClass = ['success'];
    }
  }

  setNumLosses() {
    if (this.phast.losses) {
      if (this.phast.losses.atmosphereLosses) {
        this.numLosses = this.phast.losses.atmosphereLosses.length;
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
}
