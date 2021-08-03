import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { InventoryService } from '../../inventory.service';
import { FullLoadCalculationsService } from '../calculations/full-load-calculations.service';
import { PerformancePointCalculationsService } from '../calculations/performance-point-calculations.service';
import { PerformancePointsFormService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-form.service';

@Component({
  selector: '[app-full-load]',
  templateUrl: './full-load.component.html',
  styleUrls: ['./full-load.component.css']
})
export class FullLoadComponent implements OnInit {
  @Input()
  inModification: boolean;

  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  fullLoadLabel: string;
  validationMessages: ValidationMessageMap;
  warnings: PerformancePointWarnings;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressorInventoryItem;
  constructor(private inventoryService: InventoryService, 
    private performancePointsFormService: PerformancePointsFormService,
    private compressedAirAssessmentService: CompressedAirAssessmentService, 
    private fullLoadCalculationsService: FullLoadCalculationsService,
    private performancePointCalculationsService: PerformancePointCalculationsService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        if (this.isFormChange == false) {
          this.setFullLoadLabel(compressor.compressorControls.controlType);
          this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.fullLoad.power, compressor);
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.fullLoad, compressor, 'fullLoad', this.inModification)
          this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  save() {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.performancePoints.fullLoad = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
    this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(selectedCompressor.performancePoints.fullLoad.power, selectedCompressor);
    selectedCompressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor);
    this.updateForm(selectedCompressor.performancePoints.fullLoad);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (!this.inModification) {
      let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
      compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    } else {
      let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
      let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
      let adjustedCompressorIndex: number = compressedAirAssessment.modifications[modificationIndex].useUnloadingControls.adjustedCompressors.findIndex(adjustedCompressor => { return adjustedCompressor.compressorId == selectedCompressor.itemId });
      compressedAirAssessment.modifications[modificationIndex].useUnloadingControls.adjustedCompressors[adjustedCompressorIndex].performancePoints = selectedCompressor.performancePoints;
    }
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(selectedCompressor);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  setFullLoadLabel(controlType: number) {
    if (controlType == 1 || controlType == 7 || controlType == 9) {
      this.fullLoadLabel = "";
    } else {
      this.fullLoadLabel = "(cut-in)";
    }
  }

  saveDischargePressure() {
    this.form.controls.isDefaultPressure.patchValue(false);
    this.save();
  }

  saveAirFlow() {
    this.form.controls.isDefaultAirFlow.patchValue(false);
    this.save();
  }

  savePower() {
    this.form.controls.isDefaultPower.patchValue(false);
    this.save();
  }

  checkShowCalc() {
    if (!this.selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow) {
      let defaultValue: number = this.fullLoadCalculationsService.getFullLoadAirFlow(this.selectedCompressor, true);
      this.showAirflowCalc = (this.selectedCompressor.performancePoints.fullLoad.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.fullLoad.isDefaultPower) {
      let defaultValue: number = this.fullLoadCalculationsService.getFullLoadPower(this.selectedCompressor, true);
      this.showPowerCalc = (this.selectedCompressor.performancePoints.fullLoad.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.fullLoad.isDefaultPressure) {
      let defaultValue: number = this.fullLoadCalculationsService.getFullLoadDischargePressure(this.selectedCompressor, true);
      this.showPressureCalc = (this.selectedCompressor.performancePoints.fullLoad.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.fullLoadCalculationsService.getFullLoadAirFlow(this.selectedCompressor, true);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.fullLoadCalculationsService.getFullLoadPower(this.selectedCompressor, true);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.fullLoadCalculationsService.getFullLoadDischargePressure(this.selectedCompressor, true);
    this.form.controls.dischargePressure.patchValue(defaultValue);
    this.form.controls.isDefaultPressure.patchValue(true);
    this.save();
  }

  updateForm(performancePoint: PerformancePoint) {
    if (performancePoint.airflow != this.form.controls.airflow.value) {
      this.form.controls.airflow.patchValue(performancePoint.airflow);
    }
    if (performancePoint.dischargePressure != this.form.controls.dischargePressure.value) {
      this.form.controls.dischargePressure.patchValue(performancePoint.dischargePressure);
    }
    if (performancePoint.power != this.form.controls.power.value) {
      this.form.controls.power.patchValue(performancePoint.power);
    }
  }

}
