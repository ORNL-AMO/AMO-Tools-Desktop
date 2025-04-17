import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { UntypedFormGroup } from '@angular/forms';
import { FixtureLossesCompareService } from '../../fixture-losses/fixture-losses-compare.service';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';
import { Subscription } from 'rxjs';
import { FixtureFormService } from '../../../../calculator/furnaces/fixture/fixture-form.service';

@Component({
    selector: 'app-fixture-tab',
    templateUrl: './fixture-tab.component.html',
    styleUrls: ['./fixture-tab.component.css'],
    standalone: false
})
export class FixtureTabComponent implements OnInit {
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
  constructor(private lossesService: LossesService, private fixtureFormService: FixtureFormService, private fixtureLossesCompareService: FixtureLossesCompareService, private cd: ChangeDetectorRef) { }

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
      if (this.phast.losses.fixtureLosses) {
        this.numLosses = this.phast.losses.fixtureLosses.length;
      }
    }
  }
  checkLossData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.fixtureLossesCompareService.baselineFixtureLosses) {
      this.fixtureLossesCompareService.baselineFixtureLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: { specificHeatWarning: string, feedRateWarning: string } = this.fixtureFormService.checkWarnings(loss);
        if (warnings.specificHeatWarning != null || warnings.feedRateWarning != null) {
          hasWarning = true;
        }
      });
    }
    if (this.fixtureLossesCompareService.modifiedFixtureLosses && !this.inSetup) {
      this.fixtureLossesCompareService.modifiedFixtureLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: { specificHeatWarning: string, feedRateWarning: string } = this.fixtureFormService.checkWarnings(loss);
        if (warnings.specificHeatWarning != null || warnings.feedRateWarning != null) {
          hasWarning = true;
        }
      });
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }

  checkLossValid(loss: FixtureLoss) {
    let tmpForm: UntypedFormGroup = this.fixtureFormService.getFormFromLoss(loss);
    if (tmpForm.status === 'VALID') {
      return true;
    } else {
      return false;
    }
  }

  checkDifferent() {
    if (this.fixtureLossesCompareService.baselineFixtureLosses && this.fixtureLossesCompareService.modifiedFixtureLosses) {
      return this.fixtureLossesCompareService.compareAllLosses();
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
