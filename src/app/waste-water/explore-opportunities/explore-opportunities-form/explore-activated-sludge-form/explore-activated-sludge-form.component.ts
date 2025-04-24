import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { ActivatedSludgeData, WasteWater, WasteWaterData } from '../../../../shared/models/waste-water';
import { ActivatedSludgeFormService } from '../../../activated-sludge-form/activated-sludge-form.service';
import { WasteWaterService } from '../../../waste-water.service';

@Component({
    selector: 'app-explore-activated-sludge-form',
    templateUrl: './explore-activated-sludge-form.component.html',
    styleUrls: ['./explore-activated-sludge-form.component.css'],
    standalone: false
})
export class ExploreActivatedSludgeFormComponent implements OnInit {

  baselineForm: UntypedFormGroup;
  modificationForm: UntypedFormGroup;
  modificationData: WasteWaterData;
  baselineData: WasteWaterData;
  selectedModificationIdSub: Subscription;
  // baselineWarnings: ActivatedSludgeWar;
  // modificationWarnings: AeratorPerformanceWarnings;
  selectedModificationId: string;
  settings: Settings;
  constructor(private wasteWaterService: WasteWaterService, private activatedSludgeFormService: ActivatedSludgeFormService) { }

  ngOnInit(): void {
    this.settings = this.wasteWaterService.settings.getValue();
    this.baselineData = this.wasteWaterService.wasteWater.getValue().baselineData;
    this.baselineForm = this.activatedSludgeFormService.getFormFromObj(this.baselineData.activatedSludgeData);
    // this.baselineWarnings = this.activatedSludgeFormService.checkWarnings(this.baselineData.aeratorPerformanceData);
    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
      if (val) {
        this.selectedModificationId = val;
        this.modificationData = this.wasteWaterService.getModificationFromId();
        this.modificationForm = this.activatedSludgeFormService.getFormFromObj(this.modificationData.activatedSludgeData);
        // this.modificationWarnings = this.aeratorPerformanceFormService.checkWarnings(this.modificationData.aeratorPerformanceData);
        this.initExploreMLSS();
      }
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  initExploreMLSS() {
    let hasOpportunity: boolean = (this.modificationData.activatedSludgeData.MLSSpar != this.baselineData.activatedSludgeData.MLSSpar);
    this.modificationData.exploreMLSS = { display: ' Modify Plant Control Point', hasOpportunity: hasOpportunity }
  }

  setExploreMLSS() {
    if (this.modificationData.exploreReduceOxygen.hasOpportunity == false) {
      this.modificationForm.controls.MLSSpar.patchValue(this.modificationForm.controls.MLSSpar.value);
      this.save();
    }
  }

  focusField(str: string) {
    this.wasteWaterService.modifyConditionsTab.next('activated-sludge');
    this.wasteWaterService.focusedField.next(str);
  }

  save() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let activatedSludgeData: ActivatedSludgeData = this.activatedSludgeFormService.getObjFromForm(this.modificationForm);
    // this.modificationWarnings = this.aeratorPerformanceFormService.checkWarnings(aeratorPerformanceData);
    let modificationIndex: number = wasteWater.modifications.findIndex(mod => { return mod.id == this.selectedModificationId });
    wasteWater.modifications[modificationIndex].activatedSludgeData = activatedSludgeData;
    this.wasteWaterService.updateWasteWater(wasteWater);
  }


  changePlantControlPoint() {
    if (this.modificationForm.controls.CalculateGivenSRT.value == true) {
      this.modificationForm.controls.MLSSpar.setValidators([]);
      this.modificationForm.controls.MLSSpar.updateValueAndValidity();
      this.modificationForm.controls.DefinedSRT.setValidators([Validators.required, Validators.min(0)]);
      this.modificationForm.controls.DefinedSRT.updateValueAndValidity();
    } else {
      this.modificationForm.controls.MLSSpar.setValidators([Validators.required, Validators.min(0)]);
      this.modificationForm.controls.MLSSpar.updateValueAndValidity();
      this.modificationForm.controls.DefinedSRT.setValidators([]);
      this.modificationForm.controls.DefinedSRT.updateValueAndValidity();
    }
    this.save();
  }
}
