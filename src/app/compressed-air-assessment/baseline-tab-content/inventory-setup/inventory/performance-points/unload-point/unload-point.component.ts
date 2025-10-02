import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PerformancePoint } from '../../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../../../../compressed-air-data-management.service';
import { InventoryService } from '../../inventory.service';
import { PerformancePointsFormService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-form.service';
import { CompressorInventoryItemClass } from '../../../../../calculations/CompressorInventoryItemClass';

@Component({
  selector: '[app-unload-point]',
  templateUrl: './unload-point.component.html',
  styleUrls: ['./unload-point.component.css'],
  standalone: false
})
export class UnloadPointComponent implements OnInit {

  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  validationMessages: ValidationMessageMap;
  warnings: PerformancePointWarnings;
  isFormChange: boolean = false;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressorInventoryItemClass;

  defaultCompressorSub: Subscription;
  defaultCompressor: CompressorInventoryItemClass;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointsFormService: PerformancePointsFormService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.unloadPoint.power, compressor);
        if (this.isFormChange == false) {
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.unloadPoint, compressor, 'unloadPoint', undefined);
          this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.updateForm(this.selectedCompressor.performancePoints.unloadPoint);
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
    let unloadPoint: PerformancePoint = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
    this.compressedAirDataManagementService.updateUnloadPoint(unloadPoint);
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
      this.showAirflowCalc = (this.selectedCompressor.performancePoints.unloadPoint.airflow != this.defaultCompressor.performancePoints.unloadPoint.airflow);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.unloadPoint.isDefaultPower) {
      this.showPowerCalc = (this.selectedCompressor.performancePoints.unloadPoint.power != this.defaultCompressor.performancePoints.unloadPoint.power);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.unloadPoint.isDefaultPressure) {
      this.showPressureCalc = (this.selectedCompressor.performancePoints.unloadPoint.dischargePressure != this.defaultCompressor.performancePoints.unloadPoint.dischargePressure);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    this.form.controls.airflow.patchValue(this.defaultCompressor.performancePoints.unloadPoint.airflow);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    this.form.controls.power.patchValue(this.defaultCompressor.performancePoints.unloadPoint.power);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    this.form.controls.dischargePressure.patchValue(this.defaultCompressor.performancePoints.unloadPoint.dischargePressure);
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
