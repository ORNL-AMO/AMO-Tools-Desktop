import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';

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

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  compareSubscription: Subscription;
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private exhaustGasService: ExhaustGasService, private exhaustGasCompareService: ExhaustGasCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.compareSubscription = this.exhaustGasCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })
  }

  ngOnDestroy(){
    this.compareSubscription.unsubscribe();
    this.lossSubscription.unsubscribe();
  }

  setBadgeClass(){
    let badgeStr: Array<string> = ['success'];
    if(this.missingData){
      badgeStr = ['missing-data'];
    }else if(this.inputError){
      badgeStr = ['input-error'];
    }else if(this.isDifferent){
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
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.exhaustGasCompareService.modifiedExhaustGasLosses) {
      this.exhaustGasCompareService.modifiedExhaustGasLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: ExhaustGasEAF) {
    let tmpForm: FormGroup = this.exhaustGasService.getFormFromLoss(loss);
    if (tmpForm.status == 'VALID') {
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

}
