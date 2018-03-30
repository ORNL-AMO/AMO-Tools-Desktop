import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { EnergyInputExhaustGasService } from '../../energy-input-exhaust-gas-losses/energy-input-exhaust-gas.service';
import { EnergyInputExhaustGasCompareService } from '../../energy-input-exhaust-gas-losses/energy-input-exhaust-gas-compare.service';
import { EnergyInputExhaustGasLoss } from '../../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-energy-input-exhaust-gas-tab',
  templateUrl: './energy-input-exhaust-gas-tab.component.html',
  styleUrls: ['./energy-input-exhaust-gas-tab.component.css']
})
export class EnergyInputExhaustGasTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;
  enInput2Done: boolean;
  compareSubscription: Subscription;
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private energyInputExhaustGasService: EnergyInputExhaustGasService, private energyInputExhaustGasCompareService: EnergyInputExhaustGasCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.enInput2Done = this.lossesService.enInput2Done;
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.compareSubscription = this.energyInputExhaustGasCompareService.inputError.subscribe(val => {
      this.inputError = val;
      this.setBadgeClass();
    })
  }
  ngOnDestroy() {
    this.compareSubscription.unsubscribe();
    this.lossSubscription.unsubscribe();
  }

  setBadgeClass() {
    let badgeStr: Array<string> = ['success'];
    if (this.missingData || !this.enInput2Done) {
      badgeStr = ['missing-data'];
    } else if (this.inputError) {
      badgeStr = ['input-error'];
    } else if (this.isDifferent) {
      badgeStr = ['loss-different'];
    }
    this.badgeClass = badgeStr;
    this.cd.detectChanges();
  }

  setNumLosses() {
    if (this.phast.losses) {
      if (this.phast.losses.energyInputExhaustGasLoss) {
        this.numLosses = this.phast.losses.energyInputExhaustGasLoss.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses) {
      this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses) {
      this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: EnergyInputExhaustGasLoss) {
    let tmpForm: FormGroup = this.energyInputExhaustGasService.getFormFromLoss(loss);
    if (tmpForm.status == 'VALID') {
      return true;
    } else {
      return false;
    }
  }

  checkDifferent() {
    if (this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses && this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses) {
      return this.energyInputExhaustGasCompareService.compareAllLosses();
    }
  }
}
