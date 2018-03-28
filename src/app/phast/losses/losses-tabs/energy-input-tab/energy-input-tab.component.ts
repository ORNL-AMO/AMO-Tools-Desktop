import { Component, OnInit, Input } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { EnergyInputService } from '../../energy-input/energy-input.service';
import { EnergyInputCompareService } from '../../energy-input/energy-input-compare.service';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';

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
  constructor(private lossesService: LossesService, private energyInputService: EnergyInputService, private energyInputCompareService: EnergyInputCompareService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.enInput1Done = this.lossesService.enInput1Done;
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.energyInputCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })
  }

  setBadgeClass() {
    if (this.missingData) {
      this.badgeClass = ['missing-data'];
    } else if (this.inputError) {
      this.badgeClass = ['input-error'];
    } else if (this.isDifferent) {
      this.badgeClass = ['loss-different'];
    } else {
      this.badgeClass = ['success'];
    }
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
