import { Component, OnInit, Input } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
import { AuxiliaryPowerLossesService } from '../../auxiliary-power-losses/auxiliary-power-losses.service';
import { AuxiliaryPowerCompareService } from '../../auxiliary-power-losses/auxiliary-power-compare.service';
import { AuxiliaryPowerLoss } from '../../../../shared/models/phast/losses/auxiliaryPowerLoss';

@Component({
  selector: 'app-auxiliary-power-tab',
  templateUrl: './auxiliary-power-tab.component.html',
  styleUrls: ['./auxiliary-power-tab.component.css']
})
export class AuxiliaryPowerTabComponent implements OnInit {
  @Input()
  phast: PHAST;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string>;

  constructor(private lossesService: LossesService, private auxiliaryPowerLossesService: AuxiliaryPowerLossesService, private auxiliaryPowerCompareService: AuxiliaryPowerCompareService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.setBadgeClass();
    })

    this.auxiliaryPowerCompareService.inputError.subscribe(val => {
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
      if (this.phast.losses.atmosphereLosses) {
        this.numLosses = this.phast.losses.atmosphereLosses.length;
      }
    }
  }
  checkMissingData(): boolean {
    let testVal = false;
    if (this.auxiliaryPowerCompareService.baselineAuxLosses) {
      this.auxiliaryPowerCompareService.baselineAuxLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.auxiliaryPowerCompareService.modifiedAuxLosses) {
      this.auxiliaryPowerCompareService.modifiedAuxLosses.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: AuxiliaryPowerLoss) {
    let tmpForm: FormGroup = this.auxiliaryPowerLossesService.getFormFromLoss(loss);
    if (tmpForm.status == 'VALID') {
      return true;
    } else {
      return false;
    }
  }

  checkDifferent() {
    if (this.auxiliaryPowerCompareService.baselineAuxLosses && this.auxiliaryPowerCompareService.modifiedAuxLosses) {
      return this.auxiliaryPowerCompareService.compareAllLosses();
    }
  }
}
