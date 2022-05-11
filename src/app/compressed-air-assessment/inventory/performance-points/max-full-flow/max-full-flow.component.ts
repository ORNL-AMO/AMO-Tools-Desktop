import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../../compressed-air-data-management.service';
import { InventoryService } from '../../inventory.service';
import { MaxFullFlowCalculationsService } from '../calculations/max-full-flow-calculations.service';
import { PerformancePointCalculationsService } from '../calculations/performance-point-calculations.service';
import { PerformancePointsFormService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-form.service';
@Component({
  selector: '[app-max-full-flow]',
  templateUrl: './max-full-flow.component.html',
  styleUrls: ['./max-full-flow.component.css']
})
export class MaxFullFlowComponent implements OnInit {

  settings: Settings;
  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  maxFullFlowLabel: string;
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
    private maxFullFlowCalculationsService: MaxFullFlowCalculationsService, private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.atmosphericPressure = compressedAirAssessment.systemInformation.atmosphericPressure;
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.maxFullFlow.power, compressor);

        if (this.isFormChange == false) {
          this.setMaxFullFlowLabel(compressor.compressorControls.controlType);
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.maxFullFlow, compressor, 'maxFullFlow');
          this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.updateForm(this.selectedCompressor.performancePoints.maxFullFlow);
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
    let maxFullFlow: PerformancePoint = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
    this.compressedAirDataManagementService.updateMaxFullFlow(maxFullFlow);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  setMaxFullFlowLabel(controlType: number) {
    if (controlType == 2 || controlType == 3) {
      this.maxFullFlowLabel = "(mod begins)";
    } else {
      this.maxFullFlowLabel = "(cut-out)";
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
    if (!this.selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
      let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowAirFlow(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
      this.showAirflowCalc = (this.selectedCompressor.performancePoints.maxFullFlow.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
      let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowPower(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
      this.showPowerCalc = (this.selectedCompressor.performancePoints.maxFullFlow.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
      let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowPressure(this.selectedCompressor, true, this.settings);
      this.showPressureCalc = (this.selectedCompressor.performancePoints.maxFullFlow.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowAirFlow(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowPower(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowPressure(this.selectedCompressor, true, this.settings);
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
