import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../../compressed-air-data-management.service';
import { InventoryService } from '../../inventory.service';
import { UnloadPointCalculationsService } from '../calculations/unload-point-calculations.service';
import { PerformancePointsFormService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-form.service';

@Component({
  selector: '[app-unload-point]',
  templateUrl: './unload-point.component.html',
  styleUrls: ['./unload-point.component.css']
})
export class UnloadPointComponent implements OnInit {

  settings: Settings;
  selectedCompressorSub: Subscription;
  form: FormGroup;
  validationMessages: ValidationMessageMap;
  warnings: PerformancePointWarnings;
  isFormChange: boolean = false;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressorInventoryItem;
  settingsSub: Subscription;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointsFormService: PerformancePointsFormService,
    private unloadPointCalculationsService: UnloadPointCalculationsService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirAssessmentService.settings.subscribe(settings => this.settings = settings);
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.unloadPoint.power, compressor);
        if (this.isFormChange == false) {
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.unloadPoint, compressor, 'unloadPoint');
          this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.updateForm(this.selectedCompressor.performancePoints.unloadPoint);
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.settingsSub.unsubscribe();
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
