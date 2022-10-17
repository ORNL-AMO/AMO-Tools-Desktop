import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { UntypedFormGroup } from '@angular/forms';
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
  constructor(private lossesService: LossesService, private auxiliaryPowerLossesService: AuxiliaryPowerLossesService, private auxiliaryPowerCompareService: AuxiliaryPowerCompareService, private cd: ChangeDetectorRef) { }

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
    } else if (this.inputError) {
      badgeStr = ['input-error'];
    } else if (this.isDifferent && !this.inSetup) {
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

  checkLossData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.auxiliaryPowerCompareService.baselineAuxLosses) {
      this.auxiliaryPowerCompareService.baselineAuxLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: string = this.auxiliaryPowerLossesService.checkWarnings(loss);
        if (warnings != null) {
          hasWarning = true;
        }
      });
    }
    if (this.auxiliaryPowerCompareService.modifiedAuxLosses && !this.inSetup) {
      this.auxiliaryPowerCompareService.modifiedAuxLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: string = this.auxiliaryPowerLossesService.checkWarnings(loss);
        if (warnings != null) {
          hasWarning = true;
        }
      });
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }


  checkLossValid(loss: AuxiliaryPowerLoss) {
    let tmpForm: UntypedFormGroup = this.auxiliaryPowerLossesService.getFormFromLoss(loss);
    if (tmpForm.status === 'VALID') {
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
