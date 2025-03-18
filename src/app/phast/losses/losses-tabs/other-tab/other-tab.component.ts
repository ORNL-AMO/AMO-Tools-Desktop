import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { UntypedFormGroup } from '@angular/forms';
import { OtherLossesService } from '../../other-losses/other-losses.service';
import { OtherLossesCompareService } from '../../other-losses/other-losses-compare.service';
import { OtherLoss } from '../../../../shared/models/phast/losses/otherLoss';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-other-tab',
    templateUrl: './other-tab.component.html',
    styleUrls: ['./other-tab.component.css'],
    standalone: false
})
export class OtherTabComponent implements OnInit {
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
  compareSubscription: Subscription;
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private otherLossesService: OtherLossesService, private otherLossesCompareService: OtherLossesCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    });

    this.compareSubscription = this.otherLossesCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    });

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
      if (this.phast.losses.otherLosses) {
        this.numLosses = this.phast.losses.otherLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.otherLossesCompareService.baselineOtherLoss) {
      this.otherLossesCompareService.baselineOtherLoss.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          testVal = true;
        }
      });
    }
    if (this.otherLossesCompareService.modifiedOtherLoss && !this.inSetup) {
      this.otherLossesCompareService.modifiedOtherLoss.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          testVal = true;
        }
      });
    }
    return testVal;
  }


  checkLossValid(loss: OtherLoss) {
      let tmpForm: UntypedFormGroup = this.otherLossesService.getFormFromLoss(loss);
      if (tmpForm.status === 'VALID') {
        return true;
      } else {
        return false;
      }
  }

  checkDifferent() {
    if (this.otherLossesCompareService.baselineOtherLoss && this.otherLossesCompareService.modifiedOtherLoss) {
      return this.otherLossesCompareService.compareAllLosses();
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
