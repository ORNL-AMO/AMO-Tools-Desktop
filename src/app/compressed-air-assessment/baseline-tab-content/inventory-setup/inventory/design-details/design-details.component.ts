import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressorInventoryItem, DesignDetails } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../../../compressed-air-data-management.service';
import { CompressorInventoryItemWarnings, InventoryService } from '../inventory.service';
import { PerformancePointsFormService } from '../performance-points/performance-points-form.service';
import { InventoryFormService } from '../inventory-form.service';

@Component({
    selector: 'app-design-details',
    templateUrl: './design-details.component.html',
    styleUrls: ['./design-details.component.css'],
    standalone: false
})
export class DesignDetailsComponent implements OnInit {
  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  warnings: CompressorInventoryItemWarnings;
  isFormChange: boolean = false;
  displayBlowdownTime: boolean;
  displayModulation: boolean;
  displayNoLoadPowerFM: boolean;
  displayNoLoadPowerUL: boolean;
  displayMaxFullFlow: boolean;
  contentCollapsed: boolean;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointsFormService: PerformancePointsFormService,
    private compressedAirDataManagementService: CompressedAirDataManagementService,
    private inventoryFormService: InventoryFormService) { }

  ngOnInit(): void {
    this.contentCollapsed = this.inventoryService.collapseDesignDetails;
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.warnings = this.inventoryFormService.checkWarnings(compressor);
        if (this.isFormChange == false) {
          this.form = this.inventoryFormService.getDesignDetailsFormFromObj(compressor.designDetails, compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
          this.setDisplayBlowdownTime(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
          this.setDisplayModulation(compressor.compressorControls.controlType)
          this.setDisplayMaxFullFlow(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
          this.setDisplayNoLoadPowerFM(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
          this.setDisplayNoLoadPowerUL(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
        } else {
          this.isFormChange = false;
        }
        this.setCalculatedModulatingPressureRange(compressor);
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.inventoryService.collapseDesignDetails = this.contentCollapsed;
  }

  save(updatePerformancePoints: boolean) {
    this.isFormChange = true;
    let designDetails: DesignDetails = this.inventoryFormService.getDesignDetailsObjFromForm(this.form);
    this.compressedAirDataManagementService.updateDesignDetails(designDetails, updatePerformancePoints);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  setDisplayBlowdownTime(compressorType: number, controlType: number) {
    this.displayBlowdownTime = this.inventoryFormService.checkDisplayBlowdownTime(compressorType, controlType);
  }

  setDisplayModulation(controlType: number) {
    this.displayModulation = this.inventoryFormService.checkDisplayModulation(controlType);
  }

  setDisplayNoLoadPowerFM(compressorType: number, controlType: number) {
    this.displayNoLoadPowerFM = this.inventoryFormService.checkDisplayNoLoadPowerFM(compressorType, controlType);
  }

  setDisplayNoLoadPowerUL(compressorType: number, controlType: number) {
    this.displayNoLoadPowerUL = this.inventoryFormService.checkDisplayNoLoadPowerUL(compressorType, controlType);
  }

  setDisplayMaxFullFlow(compressorType: number, controlType: number) {
    this.displayMaxFullFlow = this.performancePointsFormService.checkShowMaxFlowPerformancePoint(compressorType, controlType);
  }

  toggleCollapse() {
    this.contentCollapsed = !this.contentCollapsed;
  }

  setCalculatedModulatingPressureRange(selectedCompressor: CompressorInventoryItem) {
    if (this.displayModulation) {
      let pressureRange: number;
      if (selectedCompressor.compressorControls.controlType != 1) {
        pressureRange = (selectedCompressor.performancePoints.unloadPoint.dischargePressure - selectedCompressor.performancePoints.maxFullFlow.dischargePressure) / (1 - (selectedCompressor.compressorControls.unloadPointCapacity / 100));
        pressureRange = Number(pressureRange.toFixed(1));
      } else {
        pressureRange = selectedCompressor.performancePoints.noLoad.dischargePressure - selectedCompressor.performancePoints.fullLoad.dischargePressure;
      }
      if (isNaN(pressureRange) == false && pressureRange != this.form.controls.modulatingPressureRange.value) {
        this.form.controls.modulatingPressureRange.patchValue(pressureRange);
        this.save(false);
      }
    }
  }
}
