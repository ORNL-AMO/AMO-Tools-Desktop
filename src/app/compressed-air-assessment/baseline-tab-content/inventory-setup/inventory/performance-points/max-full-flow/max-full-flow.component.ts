import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, PerformancePoint } from '../../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../../../../compressed-air-data-management.service';
import { InventoryService } from '../../inventory.service';
import { PerformancePointsFormService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-form.service';
import { CompressorInventoryItemClass } from '../../../../../calculations/CompressorInventoryItemClass';
@Component({
  selector: '[app-max-full-flow]',
  templateUrl: './max-full-flow.component.html',
  styleUrls: ['./max-full-flow.component.css'],
  standalone: false
})
export class MaxFullFlowComponent implements OnInit {

  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  maxFullFlowLabel: string;
  validationMessages: ValidationMessageMap;
  warnings: PerformancePointWarnings;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressorInventoryItemClass;
  defaultCompressorSub: Subscription;
  defaultCompressor: CompressorInventoryItemClass;
  constructor(private inventoryService: InventoryService,
    private performancePointsFormService: PerformancePointsFormService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.maxFullFlow.power, compressor);

        if (this.isFormChange == false) {
          this.setMaxFullFlowLabel(compressor.compressorControls.controlType);
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.maxFullFlow, compressor, 'maxFullFlow', compressedAirAssessment.systemInformation);
          this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.updateForm(this.selectedCompressor.performancePoints.maxFullFlow);
          this.isFormChange = false;
        }
      }
    });
    this.defaultCompressorSub = this.inventoryService.defaultCompressor.subscribe(compressor => {
      if (compressor) {
        this.defaultCompressor = compressor;
        this.checkShowCalc();
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.defaultCompressorSub.unsubscribe();
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
      this.showAirflowCalc = (this.selectedCompressor.performancePoints.maxFullFlow.airflow != this.defaultCompressor.performancePoints.maxFullFlow.airflow);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
      this.showPowerCalc = (this.selectedCompressor.performancePoints.maxFullFlow.power != this.defaultCompressor.performancePoints.maxFullFlow.power);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
      this.showPressureCalc = (this.selectedCompressor.performancePoints.maxFullFlow.dischargePressure != this.defaultCompressor.performancePoints.maxFullFlow.dischargePressure);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    this.form.controls.airflow.patchValue(this.defaultCompressor.performancePoints.maxFullFlow.airflow);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    this.form.controls.power.patchValue(this.defaultCompressor.performancePoints.maxFullFlow.power);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    this.form.controls.dischargePressure.patchValue(this.defaultCompressor.performancePoints.maxFullFlow.dischargePressure);
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
