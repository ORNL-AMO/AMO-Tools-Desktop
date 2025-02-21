import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { LossesService } from '../../losses.service';
import { UntypedFormGroup } from '@angular/forms';
import { FlueGas, FlueGasWarnings } from '../../../../shared/models/phast/losses/flueGas';
import { Subscription } from 'rxjs';
import { FlueGasFormService } from '../../../../calculator/furnaces/flue-gas/flue-gas-form.service';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasCompareService } from '../../flue-gas-losses/flue-gas-compare.service';

@Component({
  selector: 'app-flue-gas-tab',
  templateUrl: './flue-gas-tab.component.html',
  styleUrls: ['./flue-gas-tab.component.css']
})
export class FlueGasTabComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  inSetup: boolean;
  @Input()
  settings: Settings;

  badgeHover: boolean;
  displayTooltip: boolean;

  numLosses: number = 0;
  flueGasDone: boolean;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string> = [];
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, 
              private flueGasFormService: FlueGasFormService,
              private flueGasCompareService: FlueGasCompareService, 
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.flueGasDone = this.lossesService.flueGasDone;
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
    if (this.missingData || !this.flueGasDone) {
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
      if (this.phast.losses.flueGasLosses) {
        this.numLosses = this.phast.losses.flueGasLosses.length;
      }
    }
  }

  checkWarningExists(loss: FlueGas): boolean {
    if (loss.flueGasType === 'By Mass') {
      let warnings: FlueGasWarnings = this.flueGasFormService.checkFlueGasByMassWarnings(loss.flueGasByMass, this.settings);
      let tmpHasWarning: boolean = this.flueGasFormService.checkWarningsExist(warnings);
      return tmpHasWarning;
    } else if (loss.flueGasType === 'By Volume') {
      let warnings: FlueGasWarnings = this.flueGasFormService.checkFlueGasByVolumeWarnings(loss.flueGasByVolume, this.settings);
      let tmpHasWarning: boolean = this.flueGasFormService.checkWarningsExist(warnings);
      return tmpHasWarning;
    }
  }

  checkLossData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.flueGasCompareService.baselineFlueGasLoss) {
      this.flueGasCompareService.baselineFlueGasLoss.forEach(loss => {
        if (this.checkMaterialValid(loss) === false) {
          missingData = true;
        }
        let tmpHasWarning: boolean = this.checkWarningExists(loss);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    if (this.flueGasCompareService.modifiedFlueGasLoss && !this.inSetup) {
      this.flueGasCompareService.modifiedFlueGasLoss.forEach(loss => {
        if (this.checkMaterialValid(loss) === false) {
          missingData = true;
        }
        let tmpHasWarning: boolean = this.checkWarningExists(loss);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }


  checkMaterialValid(loss: FlueGas) {
    if (loss.flueGasType === 'By Volume') {
      let tmpForm: UntypedFormGroup = this.flueGasFormService.initByVolumeFormFromLoss(loss);
      if (tmpForm.status === 'VALID') {
        return true;
      } else {
        return false;
      }
    } else if (loss.flueGasType === 'By Mass') {
      let tmpForm: UntypedFormGroup = this.flueGasFormService.initByMassFormFromLoss(loss);
      if (tmpForm.status === 'VALID') {
        return true;
      } else {
        return false;
      }
    }
  }

  checkDifferent() {
    if (this.flueGasCompareService.baselineFlueGasLoss && this.flueGasCompareService.modifiedFlueGasLoss) {
      return this.flueGasCompareService.compareAllLosses();
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
