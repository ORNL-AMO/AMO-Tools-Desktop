import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { AeratorPerformanceData, WasteWater, WasteWaterData, WasteWaterValid } from '../../../../shared/models/waste-water';
import { AeratorPerformanceFormService, AeratorPerformanceWarnings } from '../../../aerator-performance-form/aerator-performance-form.service';
import { aerationRanges, AerationRanges, getSOTRDefaults, aeratorTypes } from '../../../waste-water-defaults';
import { WasteWaterService } from '../../../waste-water.service';

@Component({
    selector: 'app-explore-aerator-form',
    templateUrl: './explore-aerator-form.component.html',
    styleUrls: ['./explore-aerator-form.component.css'],
    standalone: false
})
export class ExploreAeratorFormComponent implements OnInit {

  baselineForm: UntypedFormGroup;
  modificationForm: UntypedFormGroup;
  modificationData: WasteWaterData;
  baselineData: WasteWaterData;
  selectedModificationIdSub: Subscription;
  baselineWarnings: AeratorPerformanceWarnings;
  modificationWarnings: AeratorPerformanceWarnings;
  selectedModificationId: string;
  settings: Settings;
  showDOAlert: boolean = false;
  showOperatingTimeAlert: boolean = false;
  showSpeedAlert: boolean = false;

  aerationRanges: AerationRanges;
  SOTRDefaults: Array<{ label: string, value: number }>;
  aeratorTypes: Array<{ value: number, display: string }>;
  disableOptimize: boolean = false;
  modificationAeratorBlowerLabel: string;
  baselineAeratorBlowerLabel: string;
  constructor(private wasteWaterService: WasteWaterService, private aeratorPerformanceFormService: AeratorPerformanceFormService) { }

  ngOnInit(): void {
    this.aerationRanges = aerationRanges;
    this.SOTRDefaults = getSOTRDefaults();
    this.settings = this.wasteWaterService.settings.getValue();
    this.baselineData = this.wasteWaterService.wasteWater.getValue().baselineData;
    this.baselineForm = this.aeratorPerformanceFormService.getFormFromObj(this.baselineData.aeratorPerformanceData);
    this.setBaselineAeratorBlowerLabel();
    this.baselineWarnings = this.aeratorPerformanceFormService.checkWarnings(this.baselineData.aeratorPerformanceData);
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
      if (val) {
        this.selectedModificationId = val;
        this.modificationData = this.wasteWaterService.getModificationFromId();
        this.modificationForm = this.aeratorPerformanceFormService.getFormFromObj(this.modificationData.aeratorPerformanceData);
        this.modificationWarnings = this.aeratorPerformanceFormService.checkWarnings(this.modificationData.aeratorPerformanceData);
        this.initExploreAearatorPerformance();
        this.initExploreReduceOxygen();
        this.initExploreAeratorUpgrade();
        this.setAeratorTypeStatus();
        this.setDisableOptimize();
      }
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  initExploreAearatorPerformance() {
    let hasOpportunity: boolean = (this.modificationData.aeratorPerformanceData.OperatingTime != this.baselineData.aeratorPerformanceData.OperatingTime ||
      this.modificationData.aeratorPerformanceData.Aeration != this.baselineData.aeratorPerformanceData.Aeration ||
      this.modificationData.aeratorPerformanceData.Speed != this.baselineData.aeratorPerformanceData.Speed);
    this.modificationData.exploreAeratorPerformance = { display: 'Modify Aerator/Blower Performance', hasOpportunity: hasOpportunity }
  }

  initExploreReduceOxygen() {
    let hasOpportunity: boolean = (this.modificationData.aeratorPerformanceData.OperatingDO != this.baselineData.aeratorPerformanceData.OperatingDO);
    this.modificationData.exploreReduceOxygen = { display: ' Reduce Supplied O<sub>2</sub>', hasOpportunity: hasOpportunity }
  }


  initExploreAeratorUpgrade() {
    let hasOpportunity: boolean = (this.modificationData.aeratorPerformanceData.Aerator != this.baselineData.aeratorPerformanceData.Aerator ||
      this.modificationData.aeratorPerformanceData.SOTR != this.baselineData.aeratorPerformanceData.SOTR ||
      this.modificationData.aeratorPerformanceData.TypeAerators != this.baselineData.aeratorPerformanceData.TypeAerators);
    this.modificationData.exploreAeratorUpgrade = { display: 'Upgrade Aerator/Blower', hasOpportunity: hasOpportunity };
  }

  setExploreAeratorPerformance() {
    if (this.modificationData.exploreAeratorPerformance.hasOpportunity == false) {
      this.modificationForm.controls.OperatingTime.patchValue(this.modificationForm.controls.OperatingTime.value);
      this.modificationForm.controls.Aeration.patchValue(this.modificationForm.controls.Aeration.value);
      this.modificationForm.controls.Speed.patchValue(this.modificationForm.controls.Speed.value);
      this.save();
    }
  }

  setExploreReduceOxygen() {
    if (this.modificationData.exploreReduceOxygen.hasOpportunity == false) {
      this.modificationForm.controls.OperatingDO.patchValue(this.modificationForm.controls.OperatingDO.value);
      this.save();
    }
  }

  setExploreUpgradeAerator() {
    if (this.modificationData.exploreAeratorUpgrade.hasOpportunity == false) {
      this.modificationForm.controls.Aerator.patchValue(this.modificationForm.controls.Aerator.value);
      this.modificationForm.controls.TypeAerators.patchValue(this.modificationForm.controls.TypeAerators.value);
      this.modificationForm.controls.SOTR.patchValue(this.modificationForm.controls.SOTR.value);
      this.save();
    }
  }


  focusField(str: string) {
    this.wasteWaterService.modifyConditionsTab.next('aerator-performance');
    this.wasteWaterService.focusedField.next(str);
  }

  save() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let aeratorPerformanceData: AeratorPerformanceData = this.aeratorPerformanceFormService.getObjFromForm(this.modificationForm);
    this.modificationWarnings = this.aeratorPerformanceFormService.checkWarnings(aeratorPerformanceData);
    let modificationIndex: number = wasteWater.modifications.findIndex(mod => { return mod.id == this.selectedModificationId });
    wasteWater.modifications[modificationIndex].aeratorPerformanceData = aeratorPerformanceData;
    this.wasteWaterService.updateWasteWater(wasteWater);
    this.setDisableOptimize();
  }


  calculateDO() {
    if (!this.disableOptimize) {
      let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      let modificationIndex: number = wasteWater.modifications.findIndex(mod => { return mod.id == this.selectedModificationId });
      let optimalDo: number = this.wasteWaterService.calculateModDo(modificationIndex);
      if (optimalDo == this.modificationForm.controls.OperatingDO.value) {
        this.showDOAlert = true;
        setTimeout(() => {
          this.showDOAlert = false;
        }, 2000);
      } else {
        this.modificationForm.controls.OperatingDO.patchValue(optimalDo);
        this.save();
      }
    }
  }

  calculateOperatingTime() {
    if (!this.disableOptimize) {
      let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      let modificationIndex: number = wasteWater.modifications.findIndex(mod => { return mod.id == this.selectedModificationId });
      let optimalOperatingTime: number = this.wasteWaterService.calculateModOperatingTime(modificationIndex);
      if (optimalOperatingTime == this.modificationForm.controls.OperatingTime.value) {
        this.showOperatingTimeAlert = true;
        setTimeout(() => {
          this.showOperatingTimeAlert = false;
        }, 2000);
      } else {
        this.modificationForm.controls.OperatingTime.patchValue(optimalOperatingTime);
        this.save();
      }
    }
  }
  calculateSpeed() {
    if (!this.disableOptimize) {
      let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      let modificationIndex: number = wasteWater.modifications.findIndex(mod => { return mod.id == this.selectedModificationId });
      let optimalSpeed: number = this.wasteWaterService.calculateModSpeed(modificationIndex);
      if (optimalSpeed == this.modificationForm.controls.Speed.value) {
        this.showSpeedAlert = true;
        setTimeout(() => {
          this.showSpeedAlert = false;
        }, 2000);
      } else {
        this.modificationForm.controls.Speed.patchValue(optimalSpeed);
        this.save();
      }
    }
  }

  setDefaultSOTR() {
    if (this.modificationForm.controls.Aerator.value != 'Other') {
      let SOTRDefault: number = this.SOTRDefaults.find(SOTRValue => SOTRValue.label == this.modificationForm.controls.Aerator.value).value;
      this.modificationForm.patchValue({
        SOTR: SOTRDefault
      });
    } else {
      this.modificationForm.patchValue({
        SOTR: undefined
      });
    }
    this.setAeratorTypeStatus();
    this.save();
  }

  setAeratorTypeStatus() {
    let defaultAeratorTypes: Array<{ value: number, display: string }> = JSON.parse(JSON.stringify(aeratorTypes));
    let isDiffuserAerator: boolean = this.aerationRanges.diffusers.some(aerationRange => aerationRange.label == this.modificationForm.controls.Aerator.value);
    this.modificationForm.controls.TypeAerators.enable();

    if (this.modificationForm.controls.Aerator.value == 'Other') {
      this.modificationAeratorBlowerLabel = "Aerator/Blower";
      this.aeratorTypes = defaultAeratorTypes;
    } else if (isDiffuserAerator) {
      this.modificationAeratorBlowerLabel = "Blower";
      // Mechanical is removed. set to next option.
      if (this.modificationForm.controls.TypeAerators.value == 1) {
        this.modificationForm.patchValue({
          TypeAerators: defaultAeratorTypes[1].value
        });
      }
      this.aeratorTypes = defaultAeratorTypes.filter(aerator => aerator.value != 1);
    } else {
      this.modificationAeratorBlowerLabel = "Aerator";
      this.aeratorTypes = defaultAeratorTypes;
      this.modificationForm.patchValue({
        TypeAerators: defaultAeratorTypes[0].value
      });
      this.modificationForm.controls.TypeAerators.disable();
    }
  }

  setDisableOptimize() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let modificationIndex: number = wasteWater.modifications.findIndex(mod => { return mod.id == this.selectedModificationId });
    let modificationValid: WasteWaterValid = this.wasteWaterService.checkWasteWaterValid(wasteWater.modifications[modificationIndex].activatedSludgeData, wasteWater.modifications[modificationIndex].aeratorPerformanceData, wasteWater.modifications[modificationIndex].operations);
    this.disableOptimize = modificationValid.isValid == false;
  }


  setBaselineAeratorBlowerLabel() {
    let isDiffuserAerator: boolean = this.aerationRanges.diffusers.some(aerationRange => aerationRange.label == this.baselineForm.controls.Aerator.value);
    if (this.baselineForm.controls.Aerator.value == 'Other') {
      this.baselineAeratorBlowerLabel = "Aerator/Blower";
    } else if (isDiffuserAerator) {
      this.baselineAeratorBlowerLabel = "Blower";
    } else {
      this.baselineAeratorBlowerLabel = "Aerator";
    }
  }

}
