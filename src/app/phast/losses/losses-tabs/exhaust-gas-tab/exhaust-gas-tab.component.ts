import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { UntypedFormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';
import { ExhaustGasService } from '../../exhaust-gas/exhaust-gas.service';
import { ExhaustGasCompareService } from '../../exhaust-gas/exhaust-gas-compare.service';
import { ExhaustGasEAF } from '../../../../shared/models/phast/losses/exhaustGasEAF';

@Component({
  selector: 'app-exhaust-gas-tab',
  templateUrl: './exhaust-gas-tab.component.html',
  styleUrls: ['./exhaust-gas-tab.component.css']
})
export class ExhaustGasTabComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  inSetup: boolean;

  badgeHover: boolean;
  displayTooltip: boolean;

  numLosses: number = 0;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string> = [];
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private exhaustGasService: ExhaustGasService, private exhaustGasCompareService: ExhaustGasCompareService, private cd: ChangeDetectorRef) { }

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
    }else if (this.isDifferent && !this.inSetup) {
      badgeStr = ['loss-different'];
    }
    this.badgeClass = badgeStr;
    this.cd.detectChanges();
  }

  setNumLosses() {
    if (this.phast.losses) {
      if (this.phast.losses.exhaustGasEAF) {
        this.numLosses = this.phast.losses.exhaustGasEAF.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.exhaustGasCompareService.baselineExhaustGasLosses) {
      this.exhaustGasCompareService.baselineExhaustGasLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          testVal = true;
        }
      });
    }
    if (this.exhaustGasCompareService.modifiedExhaustGasLosses && !this.inSetup) {
      this.exhaustGasCompareService.modifiedExhaustGasLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          testVal = true;
        }
      });
    }
    return testVal;
  }


  checkLossValid(loss: ExhaustGasEAF) {
    let tmpForm: UntypedFormGroup = this.exhaustGasService.getFormFromLoss(loss);
    if (tmpForm.status === 'VALID') {
      return true;
    } else {
      return false;
    }
  }

  checkDifferent() {
    if (this.exhaustGasCompareService.baselineExhaustGasLosses && this.exhaustGasCompareService.modifiedExhaustGasLosses) {
      return this.exhaustGasCompareService.compareAllLosses();
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
