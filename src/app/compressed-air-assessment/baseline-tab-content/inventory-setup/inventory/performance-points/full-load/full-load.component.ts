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
  selector: '[app-full-load]',
  templateUrl: './full-load.component.html',
  styleUrls: ['./full-load.component.css'],
  standalone: false
})
export class FullLoadComponent implements OnInit {

  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  fullLoadLabel: string;
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
        this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.fullLoad.power, compressor);
        if (this.isFormChange == false) {
          this.setFullLoadLabel(compressor.compressorControls.controlType);
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.fullLoad, compressor, 'fullLoad', compressedAirAssessment.systemInformation)
          this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.updateForm(compressor.performancePoints.fullLoad);
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
    let fullLoad: PerformancePoint = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
    this.compressedAirDataManagementService.updateFullLoad(fullLoad);
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
      this.showAirflowCalc = (this.selectedCompressor.performancePoints.fullLoad.airflow != this.defaultCompressor.performancePoints.fullLoad.airflow);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.fullLoad.isDefaultPower) {
      this.showPowerCalc = (this.selectedCompressor.performancePoints.fullLoad.power != this.defaultCompressor.performancePoints.fullLoad.power);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.fullLoad.isDefaultPressure) {
      this.showPressureCalc = (this.selectedCompressor.performancePoints.fullLoad.dischargePressure != this.defaultCompressor.performancePoints.fullLoad.dischargePressure);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    this.form.controls.airflow.patchValue(this.defaultCompressor.performancePoints.fullLoad.airflow);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    this.form.controls.power.patchValue(this.defaultCompressor.performancePoints.fullLoad.power);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    this.form.controls.dischargePressure.patchValue(this.defaultCompressor.performancePoints.fullLoad.dischargePressure);
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
