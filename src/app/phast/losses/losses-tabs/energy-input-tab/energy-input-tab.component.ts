import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { Losses, PHAST, PhastResults } from '../../../../shared/models/phast/phast';
import { UntypedFormGroup } from '@angular/forms';
import { EnergyInputService } from '../../energy-input/energy-input.service';
import { EnergyInputCompareService } from '../../energy-input/energy-input-compare.service';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { PhastCompareService } from '../../../phast-compare.service';
import { EnergyInputWarnings, PhastResultsService } from '../../../phast-results.service';

@Component({
  selector: 'app-energy-input-tab',
  templateUrl: './energy-input-tab.component.html',
  styleUrls: ['./energy-input-tab.component.css']
})
export class EnergyInputTabComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  inSetup: boolean;
  @Input()
  settings: Settings;

  badgeHover: boolean;
  displayTooltip: boolean;

  warnings: EnergyInputWarnings = {energyInputHeatDelivered: null, electricityInputWarning: null};
  lossDataStatus: { invalid: boolean, hasWarning: boolean };
  
  numLosses: number = 0;
  isValid: boolean;
  isDifferent: boolean;
  badgeClass: Array<string> = [];
  enInput1Done: boolean;
  compareSubscription: Subscription;
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private energyInputService: EnergyInputService, private energyInputCompareService: EnergyInputCompareService, private cd: ChangeDetectorRef,
    private phastCompareService: PhastCompareService, private phastResultsService: PhastResultsService) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.enInput1Done = this.lossesService.enInput1Done;
      this.lossDataStatus = this.checkLossData();
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
    if (this.lossDataStatus.invalid || !this.enInput1Done) {
      badgeStr = ['missing-data'];
    } else if (this.lossDataStatus.hasWarning) {
      badgeStr = ['input-error'];
    }else if (this.isDifferent && !this.inSetup) {
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

  checkLossData(): { invalid: boolean, hasWarning: boolean } {
    let baselineValid = true;
    let baselineWarning: boolean = false;
    if (this.energyInputCompareService.baselineEnergyInput) {
      let baselineResults: PhastResults = this.phastResultsService.getResults(this.phast, this.settings);
      this.energyInputCompareService.baselineEnergyInput.forEach(loss => {
        baselineValid = this.isLossValid(loss, this.phast, baselineResults);
        let warnings = this.energyInputService.checkWarnings(this.phast, baselineResults, this.settings);
        baselineWarning = Boolean(warnings.electricityInputWarning || warnings.energyInputHeatDelivered);
      });
    }

    let modificationValid = true;
    let modificationWarning = false;
    if (this.energyInputCompareService.modifiedEnergyInput && !this.inSetup) {
      let selectedModificationPhast: PHAST = this.phastCompareService.selectedModification.getValue();
      let modPhastResults: PhastResults = this.phastResultsService.getResults(selectedModificationPhast, this.settings);
      this.energyInputCompareService.modifiedEnergyInput.forEach(loss => {
        modificationValid = this.isLossValid(loss, selectedModificationPhast, modPhastResults);
        let warnings = this.energyInputService.checkWarnings(selectedModificationPhast, modPhastResults, this.settings);
        modificationWarning = Boolean(warnings.electricityInputWarning || warnings.energyInputHeatDelivered);
      });
    }

    return { invalid: !baselineValid || !modificationValid, hasWarning: baselineWarning || modificationWarning };
  }


  isLossValid(loss: EnergyInputEAF, phast: PHAST, phastResults: PhastResults) {
    let minElectricityInput: number;
    if (phast) {
      minElectricityInput = this.energyInputService.getMinElectricityInputRequirement(phast, phastResults, this.settings);
    }
    let tmpForm: UntypedFormGroup = this.energyInputService.getFormFromLoss(loss, minElectricityInput);
    if (tmpForm.status === 'VALID') {
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
