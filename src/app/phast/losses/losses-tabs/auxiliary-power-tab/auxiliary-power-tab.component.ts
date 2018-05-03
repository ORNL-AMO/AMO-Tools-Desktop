import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { AuxiliaryPowerLossesService } from '../../auxiliary-power-losses/auxiliary-power-losses.service';
import { AuxiliaryPowerCompareService } from '../../auxiliary-power-losses/auxiliary-power-compare.service';
import { AuxiliaryPowerLoss } from '../../../../shared/models/phast/losses/auxiliaryPowerLoss';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-auxiliary-power-tab',
  templateUrl: './auxiliary-power-tab.component.html',
  styleUrls: ['./auxiliary-power-tab.component.css']
})
export class AuxiliaryPowerTabComponent implements OnInit {
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
  constructor(private lossesService: LossesService, private auxiliaryPowerLossesService: AuxiliaryPowerLossesService, private auxiliaryPowerCompareService: AuxiliaryPowerCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.compareSubscription = this.auxiliaryPowerCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })

    this.badgeHover = false;
  }

  ngOnDestroy() {
    this.compareSubscription.unsubscribe();
    this.lossSubscription.unsubscribe();
  }

  setBadgeClass() {
    let badgeStr: Array<string> = ['success'];
    if (this.missingData) {
      badgeStr = ['missing-data'];
    } else if (this.inputError) {
      badgeStr = ['input-error'];
    } else if (this.isDifferent) {
      badgeStr = ['loss-different'];
    }
    this.badgeClass = badgeStr;
    this.cd.detectChanges();
  }


  setNumLosses() {
    if (this.phast.losses) {
      if (this.phast.losses.auxiliaryPowerLosses) {
        this.numLosses = this.phast.losses.auxiliaryPowerLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.auxiliaryPowerCompareService.baselineAuxLosses) {
      this.auxiliaryPowerCompareService.baselineAuxLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.auxiliaryPowerCompareService.modifiedAuxLosses) {
      this.auxiliaryPowerCompareService.modifiedAuxLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: AuxiliaryPowerLoss) {
    let tmpForm: FormGroup = this.auxiliaryPowerLossesService.getFormFromLoss(loss);
    if (tmpForm.status == 'VALID') {
      return true;
    } else {
      return false;
    }
  }

  checkDifferent() {
    if (this.auxiliaryPowerCompareService.baselineAuxLosses && this.auxiliaryPowerCompareService.modifiedAuxLosses) {
      return this.auxiliaryPowerCompareService.compareAllLosses();
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
