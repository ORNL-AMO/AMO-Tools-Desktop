import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { UntypedFormGroup } from '@angular/forms';
import { WallLossCompareService } from '../../wall-losses/wall-loss-compare.service';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';
import { Subscription } from 'rxjs';
import { WallFormService, WallLossWarnings } from '../../../../calculator/furnaces/wall/wall-form.service';

@Component({
    selector: 'app-wall-tab',
    templateUrl: './wall-tab.component.html',
    styleUrls: ['./wall-tab.component.css'],
    standalone: false
})
export class WallTabComponent implements OnInit {
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
  constructor(private lossesService: LossesService, private wallFormService: WallFormService, private wallLossCompareService: WallLossCompareService, private cd: ChangeDetectorRef) { }

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
      if (this.phast.losses.wallLosses) {
        this.numLosses = this.phast.losses.wallLosses.length;
      }
    }
  }
  checkLossData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.wallLossCompareService.baselineWallLosses) {
      this.wallLossCompareService.baselineWallLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: WallLossWarnings = this.wallFormService.checkWarnings(loss);
        let tmpHasWarning: boolean = this.wallFormService.checkWarningsExist(warnings);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    if (this.wallLossCompareService.modifiedWallLosses && !this.inSetup) {
      this.wallLossCompareService.modifiedWallLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: WallLossWarnings = this.wallFormService.checkWarnings(loss);
        let tmpHasWarning: boolean = this.wallFormService.checkWarningsExist(warnings);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }


  checkLossValid(loss: WallLoss) {
    let tmpForm: UntypedFormGroup = this.wallFormService.getWallLossForm(loss);
    if (tmpForm.status === 'VALID') {
      return true;
    } else {
      return false;
    }
  }

  checkDifferent() {
    if (this.wallLossCompareService.baselineWallLosses && this.wallLossCompareService.modifiedWallLosses) {
      return this.wallLossCompareService.compareAllLosses();
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
