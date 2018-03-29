import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { EnergyInputService } from '../../energy-input/energy-input.service';
import { EnergyInputCompareService } from '../../energy-input/energy-input-compare.service';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-energy-input-tab',
  templateUrl: './energy-input-tab.component.html',
  styleUrls: ['./energy-input-tab.component.css']
})
export class EnergyInputTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  enInput1Done: boolean;
  compareSubscription: Subscription;
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private energyInputService: EnergyInputService, private energyInputCompareService: EnergyInputCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.enInput1Done = this.lossesService.enInput1Done;
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.compareSubscription = this.energyInputCompareService.inputError.subscribe(val => {
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
    if(this.missingData || !this.enInput1Done){
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
      if (this.phast.losses.energyInputEAF) {
        this.numLosses = this.phast.losses.energyInputEAF.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.energyInputCompareService.baselineEnergyInput) {
      this.energyInputCompareService.baselineEnergyInput.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.energyInputCompareService.modifiedEnergyInput) {
      this.energyInputCompareService.modifiedEnergyInput.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: EnergyInputEAF) {
    let tmpForm: FormGroup = this.energyInputService.getFormFromLoss(loss);
    if (tmpForm.status == 'VALID') {
      return true;
    } else {
      return false;
    }
  }

  checkDifferent() {
    if (this.energyInputCompareService.baselineEnergyInput && this.energyInputCompareService.modifiedEnergyInput) {
      return this.energyInputCompareService.compareAllLosses();
    }
  }
}
