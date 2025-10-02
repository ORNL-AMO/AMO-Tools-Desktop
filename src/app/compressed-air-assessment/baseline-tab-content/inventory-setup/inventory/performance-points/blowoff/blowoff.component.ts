import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressorInventoryItem, PerformancePoint } from '../../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../../../../compressed-air-data-management.service';
import { InventoryService } from '../../inventory.service';
import { BlowoffCalculationsService } from '../calculations/blowoff-calculations.service';
import { PerformancePointsFormService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-form.service';

@Component({
    selector: '[app-blowoff]',
    templateUrl: './blowoff.component.html',
    styleUrls: ['./blowoff.component.css'],
    standalone: false
})
export class BlowoffComponent implements OnInit {

  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  validationMessages: ValidationMessageMap;
  warnings: PerformancePointWarnings;
  isFormChange: boolean = false;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressorInventoryItem;
  constructor(private inventoryService: InventoryService,
    private performancePointsFormService: PerformancePointsFormService,
    private compressedAirAssessmentService: CompressedAirAssessmentService, private blowoffCalculationsService: BlowoffCalculationsService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.blowoff.power, compressor);
        if (this.isFormChange == false) {
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.blowoff, compressor, 'blowoff', undefined);
          this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.updateForm(compressor.performancePoints.blowoff);
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
    let blowoff: PerformancePoint = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
    this.compressedAirDataManagementService.updateBlowoff(blowoff)
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
    if (!this.selectedCompressor.performancePoints.blowoff.isDefaultAirFlow) {
      let defaultValue: number = this.blowoffCalculationsService.getBlowoffAirFlow(this.selectedCompressor, true, this.settings);
      this.showAirflowCalc = (this.selectedCompressor.performancePoints.blowoff.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.blowoff.isDefaultPower) {
      let defaultValue: number = this.blowoffCalculationsService.getBlowoffPower(this.selectedCompressor, true);
      this.showPowerCalc = (this.selectedCompressor.performancePoints.blowoff.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.blowoff.isDefaultPressure) {
      let defaultValue: number = this.blowoffCalculationsService.getBlowoffDischargePressure(this.selectedCompressor, true, this.settings);
      this.showPressureCalc = (this.selectedCompressor.performancePoints.blowoff.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.blowoffCalculationsService.getBlowoffAirFlow(this.selectedCompressor, true, this.settings);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.blowoffCalculationsService.getBlowoffPower(this.selectedCompressor, true);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.blowoffCalculationsService.getBlowoffDischargePressure(this.selectedCompressor, true, this.settings);
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
