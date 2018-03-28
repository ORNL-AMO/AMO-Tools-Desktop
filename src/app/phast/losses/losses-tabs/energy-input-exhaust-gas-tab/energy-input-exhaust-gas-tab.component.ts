import { Component, OnInit, Input } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { EnergyInputExhaustGasService } from '../../energy-input-exhaust-gas-losses/energy-input-exhaust-gas.service';
import { EnergyInputExhaustGasCompareService } from '../../energy-input-exhaust-gas-losses/energy-input-exhaust-gas-compare.service';
import { EnergyInputExhaustGasLoss } from '../../../../shared/models/phast/losses/energyInputExhaustGasLosses';

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
  constructor(private lossesService: LossesService, private energyInputExhaustGasService: EnergyInputExhaustGasService, private energyInputExhaustGasCompareService: EnergyInputExhaustGasCompareService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.enInput2Done = this.lossesService.enInput2Done;
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.energyInputExhaustGasCompareService.inputError.subscribe(val => {
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
