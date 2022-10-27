import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { UntypedFormGroup } from '@angular/forms';
import { EnergyInputExhaustGasService } from '../../energy-input-exhaust-gas-losses/energy-input-exhaust-gas.service';
import { EnergyInputExhaustGasCompareService } from '../../energy-input-exhaust-gas-losses/energy-input-exhaust-gas-compare.service';
import { EnergyInputExhaustGasLoss } from '../../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-energy-input-exhaust-gas-tab',
  templateUrl: './energy-input-exhaust-gas-tab.component.html',
  styleUrls: ['./energy-input-exhaust-gas-tab.component.css']
})
export class EnergyInputExhaustGasTabComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  inSetup: boolean;
  @Input()
  settings: Settings;

  badgeHover: boolean;
  displayTooltip: boolean;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string> = [];
  enInput2Done: boolean;
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private energyInputExhaustGasService: EnergyInputExhaustGasService, private energyInputExhaustGasCompareService: EnergyInputExhaustGasCompareService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.enInput2Done = this.lossesService.enInput2Done;
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
    if (this.missingData || !this.enInput2Done) {
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
      if (this.phast.losses.energyInputExhaustGasLoss) {
        this.numLosses = this.phast.losses.energyInputExhaustGasLoss.length;
      }
    }
  }

  checkLossData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses) {
      this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: { heatWarning: string } = this.energyInputExhaustGasService.checkWarnings(loss, this.settings);
        if (warnings.heatWarning != null) {
          hasWarning = true;
        }
      });
    }
    if (this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses && !this.inSetup) {
      this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: { heatWarning: string } = this.energyInputExhaustGasService.checkWarnings(loss, this.settings);
        if (warnings.heatWarning != null) {
          hasWarning = true;
        }
      });
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }


  checkLossValid(loss: EnergyInputExhaustGasLoss) {
    let tmpForm: UntypedFormGroup = this.energyInputExhaustGasService.getFormFromLoss(loss);
    if (tmpForm.status === 'VALID') {
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
