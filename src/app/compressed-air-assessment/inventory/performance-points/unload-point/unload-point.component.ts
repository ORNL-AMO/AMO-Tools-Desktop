import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { InventoryService } from '../../inventory.service';
import { UnloadPointCalculationsService } from '../calculations/unload-point-calculations.service';
import { PerformancePointsFormService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-form.service';

@Component({
  selector: 'app-unload-point',
  templateUrl: './unload-point.component.html',
  styleUrls: ['./unload-point.component.css']
})
export class UnloadPointComponent implements OnInit {
  selectedCompressorSub: Subscription;
  form: FormGroup;
  validationMessages: ValidationMessageMap;
  warnings: PerformancePointWarnings;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressorInventoryItem;
  constructor(private inventoryService: InventoryService,
    private performancePointsFormService: PerformancePointsFormService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private unloadPointCalculationsService: UnloadPointCalculationsService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.unloadPoint.power, compressor);
        this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.unloadPoint, compressor, 'unloadPoint');
        this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  save() {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.performancePoints.unloadPoint = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
    compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(selectedCompressor);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
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
    if (!this.selectedCompressor.performancePoints.unloadPoint.isDefaultAirFlow) {
      let defaultValue: number = this.unloadPointCalculationsService.getUnloadAirFlow(this.selectedCompressor, true);
      this.showAirflowCalc = (this.selectedCompressor.performancePoints.unloadPoint.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.unloadPoint.isDefaultPower) {
      let defaultValue: number = this.unloadPointCalculationsService.getUnloadPower(this.selectedCompressor, true);
      this.showPowerCalc = (this.selectedCompressor.performancePoints.unloadPoint.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.unloadPoint.isDefaultPressure) {
      let defaultValue: number = this.unloadPointCalculationsService.getUnloadPressure(this.selectedCompressor, true);
      this.showPressureCalc = (this.selectedCompressor.performancePoints.unloadPoint.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.unloadPointCalculationsService.getUnloadAirFlow(this.selectedCompressor, true);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.unloadPointCalculationsService.getUnloadPower(this.selectedCompressor, true);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.unloadPointCalculationsService.getUnloadPressure(this.selectedCompressor, true);
    this.form.controls.dischargePressure.patchValue(defaultValue);
    this.form.controls.isDefaultPressure.patchValue(true);
    this.save();
  }
}
