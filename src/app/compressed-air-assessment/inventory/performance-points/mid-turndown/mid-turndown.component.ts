import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../../compressed-air-data-management.service';
import { InventoryService } from '../../inventory.service';
import { MidTurndownCalculationService } from '../calculations/mid-turndown-calculation.service';
import { PerformancePointsFormService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-form.service';

@Component({
    selector: '[app-mid-turndown]',
    templateUrl: './mid-turndown.component.html',
    styleUrls: ['./mid-turndown.component.css'],
    standalone: false
})
export class MidTurndownComponent implements OnInit {

  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  validationMessages: ValidationMessageMap;
  warnings: PerformancePointWarnings;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressorInventoryItem;
  atmosphericPressure: number;
  constructor(private inventoryService: InventoryService,
    private performancePointsFormService: PerformancePointsFormService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private midTurndownCalculationService: MidTurndownCalculationService, private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.atmosphericPressure = compressedAirAssessment.systemInformation.atmosphericPressure;
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.midTurndown.power, compressor);

        if (this.isFormChange == false) {
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.midTurndown, compressor, 'midTurndown', compressedAirAssessment.systemInformation);
          // this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.updateForm(this.selectedCompressor.performancePoints.midTurndown);
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  save() {
    this.isFormChange = true;
    let midTurndown: PerformancePoint = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
    this.compressedAirDataManagementService.updateMidturndown(midTurndown);
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
    if (!this.selectedCompressor.performancePoints.midTurndown.isDefaultAirFlow) {
      let defaultValue: number = this.midTurndownCalculationService.getMidTurndownAirflow(this.selectedCompressor, true, this.settings);
      this.showAirflowCalc = (this.selectedCompressor.performancePoints.midTurndown.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.midTurndown.isDefaultPower) {
      let defaultValue: number = this.midTurndownCalculationService.getMidTurndownPower(this.selectedCompressor, true);
      this.showPowerCalc = (this.selectedCompressor.performancePoints.midTurndown.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.midTurndown.isDefaultPressure) {
      let defaultValue: number = this.midTurndownCalculationService.getMidTurndownPressure(this.selectedCompressor, true, this.settings);
      this.showPressureCalc = (this.selectedCompressor.performancePoints.midTurndown.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.midTurndownCalculationService.getMidTurndownAirflow(this.selectedCompressor, true, this.settings);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.midTurndownCalculationService.getMidTurndownPower(this.selectedCompressor, true);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.midTurndownCalculationService.getMidTurndownPressure(this.selectedCompressor, true, this.settings);
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
