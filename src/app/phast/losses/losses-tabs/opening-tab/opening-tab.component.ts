import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { OpeningLossesCompareService } from '../../opening-losses/opening-losses-compare.service';
import { OpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';
import { Subscription } from 'rxjs';
import { OpeningLossWarnings, OpeningService } from '../../../../calculator/furnaces/opening/opening.service';
import { OpeningFormService } from '../../../../calculator/furnaces/opening/opening-form.service';

@Component({
  selector: 'app-opening-tab',
  templateUrl: './opening-tab.component.html',
  styleUrls: ['./opening-tab.component.css']
})
export class OpeningTabComponent implements OnInit {
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
  constructor(private lossesService: LossesService, 
              private openingLossesService: OpeningService,
              private openingFormService: OpeningFormService, 
              private openingLossesCompareService: OpeningLossesCompareService, private cd: ChangeDetectorRef) { }

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
      if (this.phast.losses.openingLosses) {
        this.numLosses = this.phast.losses.openingLosses.length;
      }
    }
  }
  checkLossData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.openingLossesCompareService.baselineOpeningLosses) {
      this.openingLossesCompareService.baselineOpeningLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: OpeningLossWarnings = this.openingLossesService.checkWarnings(loss);
        let tmpHasWarning: boolean = this.openingLossesService.checkWarningsExist(warnings);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    if (this.openingLossesCompareService.modifiedOpeningLosses && !this.inSetup) {
      this.openingLossesCompareService.modifiedOpeningLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: OpeningLossWarnings = this.openingLossesService.checkWarnings(loss);
        let tmpHasWarning: boolean = this.openingLossesService.checkWarningsExist(warnings);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }


  checkLossValid(loss: OpeningLoss) {
      let tmpForm: FormGroup = this.openingFormService.getFormFromLoss(loss);
      if (tmpForm.status === 'VALID') {
        return true;
      } else {
        return false;
      }
  }

  checkDifferent() {
    if (this.openingLossesCompareService.baselineOpeningLosses && this.openingLossesCompareService.modifiedOpeningLosses) {
      return this.openingLossesCompareService.compareAllLosses();
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
