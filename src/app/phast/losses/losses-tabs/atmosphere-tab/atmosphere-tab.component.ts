import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { AtmosphereLossesCompareService } from '../../atmosphere-losses/atmosphere-losses-compare.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { UntypedFormGroup } from '@angular/forms';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';
import { Subscription } from 'rxjs';
import { AtmosphereFormService, AtmosphereLossWarnings } from '../../../../calculator/furnaces/atmosphere/atmosphere-form.service';

@Component({
  selector: 'app-atmosphere-tab',
  templateUrl: './atmosphere-tab.component.html',
  styleUrls: ['./atmosphere-tab.component.css']
})
export class AtmosphereTabComponent implements OnInit {
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
  constructor(private lossesService: LossesService, private atmosphereLossesCompareService: AtmosphereLossesCompareService, private atmosphereFormService: AtmosphereFormService, private cd: ChangeDetectorRef) { }

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
      if (this.phast.losses.atmosphereLosses) {
        this.numLosses = this.phast.losses.atmosphereLosses.length;
      }
    }
  }

  checkLossData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.atmosphereLossesCompareService.baselineAtmosphereLosses) {
      this.atmosphereLossesCompareService.baselineAtmosphereLosses.forEach(loss => {
        //missingData
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        //warnings
        let warnings: AtmosphereLossWarnings = this.atmosphereFormService.checkWarnings(loss);
        let tmpHasWarning: boolean = warnings.temperatureWarning != undefined;
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }

      });
    }
    if (this.atmosphereLossesCompareService.modifiedAtmosphereLosses && !this.inSetup) {
      this.atmosphereLossesCompareService.modifiedAtmosphereLosses.forEach(loss => {
        //missingData
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        //warnings
        let warnings: AtmosphereLossWarnings = this.atmosphereFormService.checkWarnings(loss);
        let tmpHasWarning: boolean = warnings.temperatureWarning != undefined;
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }

  checkLossValid(loss: AtmosphereLoss) {
    let tmpForm: UntypedFormGroup = this.atmosphereFormService.getAtmosphereForm(loss);
    if (tmpForm.status === 'VALID') {
      return true;
    } else {
      return false;
    }
  }

  checkDifferent() {
    if (this.atmosphereLossesCompareService.baselineAtmosphereLosses && this.atmosphereLossesCompareService.modifiedAtmosphereLosses) {
      return this.atmosphereLossesCompareService.compareAllLosses();
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
