import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../inventory.service';
import { ControlTypes } from '../inventoryOptions';
import { PerformancePointCalculationsService } from '../performance-points/calculations/performance-point-calculations.service';

@Component({
  selector: 'app-control-data',
  templateUrl: './control-data.component.html',
  styleUrls: ['./control-data.component.css']
})
export class ControlDataComponent implements OnInit {

  selectedCompressorSub: Subscription;
  isFormChange: boolean = false;
  form: FormGroup;
  controlTypeOptions: Array<{ value: number, label: string, compressorTypes: Array<number> }>;
  displayUnload: boolean;
  displayAutomaticShutdown: boolean;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointCalculationsService: PerformancePointCalculationsService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getCompressorControlsFormFromObj(val.compressorControls);
          this.toggleDisableControls();
          this.setControlTypeOptions(val.nameplateData.compressorType);
          this.setDisplayValues();
        } else {
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  setControlTypeOptions(compressorType: number) {
    if (compressorType) {
      this.controlTypeOptions = ControlTypes.filter(type => { return type.compressorTypes.includes(compressorType) });
    } else {
      this.controlTypeOptions = [];
    }
    let controlOptionSelected: { value: number, label: string, compressorTypes: Array<number> } = this.controlTypeOptions.find(option => { 
      return option.value == this.form.controls.controlType.value;
    });
    if(!controlOptionSelected){
      this.form.controls.controlType.patchValue(undefined);
      this.changeControlType();
    }
  }

  changeControlType() {
    this.form = this.inventoryService.setCompressorControlValidators(this.form);
    if (this.form.controls.controlType.value == 2 || this.form.controls.controlType.value == 3
      || this.form.controls.controlType.value == 4 || this.form.controls.controlType.value == 6) {
      this.form.controls.numberOfUnloadSteps.patchValue(2);
    }
    if (this.form.controls.controlType.value == 4 || this.form.controls.controlType.value == 6 || this.form.controls.controlType.value == 7) {
      this.form.controls.unloadPointCapacity.patchValue(100);
    }
    this.toggleDisableControls();
    this.setDisplayValues();

    this.save(true);
  }

  toggleDisableControls() {
    if (this.form.controls.controlType.value == 4 || this.form.controls.controlType.value == 7) {
      this.form.controls.unloadPointCapacity.disable();
    } else {
      this.form.controls.unloadPointCapacity.enable();
    }

    if (this.form.controls.controlType.value == 2 || this.form.controls.controlType.value == 3
      || this.form.controls.controlType.value == 4) {
      this.form.controls.numberOfUnloadSteps.disable();
    } else {
      this.form.controls.numberOfUnloadSteps.enable();
    }
  }

  setDisplayValues() {
    this.displayUnload = this.inventoryService.checkDisplayUnloadCapacity(this.form.controls.controlType.value);
    this.displayAutomaticShutdown = this.inventoryService.checkDisplayAutomaticShutdown(this.form.controls.controlType.value);
  }

  save(updatePerformancePoints?: boolean) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.compressorControls = this.inventoryService.getCompressorControlsObjFromForm(this.form);
    if(updatePerformancePoints){
      selectedCompressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor);
    }
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
    compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(selectedCompressor);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
}
