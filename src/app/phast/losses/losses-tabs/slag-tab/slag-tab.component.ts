import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { UntypedFormGroup } from '@angular/forms';
import { SlagService } from '../../slag/slag.service';
import { SlagCompareService } from '../../slag/slag-compare.service';
import { Slag } from '../../../../shared/models/phast/losses/slag';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-slag-tab',
    templateUrl: './slag-tab.component.html',
    styleUrls: ['./slag-tab.component.css'],
    standalone: false
})
export class SlagTabComponent implements OnInit {
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
  constructor(private lossesService: LossesService, private slagService: SlagService, private slagCompareService: SlagCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
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
      if (this.phast.losses.slagLosses) {
        this.numLosses = this.phast.losses.slagLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.slagCompareService.baselineSlag) {
      this.slagCompareService.baselineSlag.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          testVal = true;
        }
      });
    }
    if (this.slagCompareService.modifiedSlag && !this.inSetup) {
      this.slagCompareService.modifiedSlag.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          testVal = true;
        }
      });
    }
    return testVal;
  }


  checkLossValid(loss: Slag) {
      let tmpForm: UntypedFormGroup = this.slagService.getFormFromLoss(loss);
      if (tmpForm.status === 'VALID') {
        return true;
      } else {
        return false;
      }
  }

  checkDifferent() {
    if (this.slagCompareService.baselineSlag && this.slagCompareService.modifiedSlag) {
      return this.slagCompareService.compareAllLosses();
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
