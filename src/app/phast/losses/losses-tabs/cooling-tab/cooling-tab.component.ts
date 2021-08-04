import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { CoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { CoolingLossesCompareService } from '../../cooling-losses/cooling-losses-compare.service';
import { Subscription } from 'rxjs';
import { CoolingFormService, GasCoolingWarnings, LiquidCoolingWarnings } from '../../../../calculator/furnaces/cooling/cooling-form.service';
@Component({
  selector: 'app-cooling-tab',
  templateUrl: './cooling-tab.component.html',
  styleUrls: ['./cooling-tab.component.css']
})
export class CoolingTabComponent implements OnInit {
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
  constructor(private lossesService: LossesService, private coolingLossesCompareService: CoolingLossesCompareService, private coolingFormService: CoolingFormService, private cd: ChangeDetectorRef) { }

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
      if (this.phast.losses.coolingLosses) {
        this.numLosses = this.phast.losses.coolingLosses.length;
      }
    }
  }

  checkWarningExists(loss: CoolingLoss): boolean {
    if (loss.coolingLossType === 'Gas' || loss.coolingLossType === 'Air' || loss.coolingLossType === 'Other Gas') {
      let warnings: GasCoolingWarnings = this.coolingFormService.checkGasWarnings(loss.gasCoolingLoss);
      let tmpHasWarning: boolean = this.coolingFormService.checkWarningsExist(warnings);
      return tmpHasWarning;
    } else if (loss.coolingLossType === 'Liquid' || loss.coolingLossType === 'Water' || loss.coolingLossType === 'Other Liquid') {
      let warnings: LiquidCoolingWarnings = this.coolingFormService.checkLiquidWarnings(loss.liquidCoolingLoss);
      let tmpHasWarning: boolean = this.coolingFormService.checkWarningsExist(warnings);
      return tmpHasWarning;
    }
  }

  checkLossData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.coolingLossesCompareService.baselineCoolingLosses) {
      this.coolingLossesCompareService.baselineCoolingLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let tmpHasWarning: boolean = this.checkWarningExists(loss);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    if (this.coolingLossesCompareService.modifiedCoolingLosses && !this.inSetup) {
      this.coolingLossesCompareService.modifiedCoolingLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let tmpHasWarning: boolean = this.checkWarningExists(loss);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }


  checkLossValid(loss: CoolingLoss) {
    if (loss.coolingLossType === 'Gas') {
      let tmpForm: FormGroup = this.coolingFormService.initGasFormFromLoss(loss);
      if (tmpForm.status === 'VALID') {
        return true;
      } else {
        return false;
      }
    } else if (loss.coolingLossType === 'Liquid') {
      let tmpForm: FormGroup = this.coolingFormService.initLiquidFormFromLoss(loss);
      if (tmpForm.status === 'VALID') {
        return true;
      } else {
        return false;
      }
    }
  }

  checkDifferent() {
    if (this.coolingLossesCompareService.baselineCoolingLosses && this.coolingLossesCompareService.modifiedCoolingLosses) {
      return this.coolingLossesCompareService.compareAllLosses();
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
