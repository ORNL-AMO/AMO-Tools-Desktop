import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, PerformancePoint } from '../../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../../../../compressed-air-data-management.service';
import { InventoryService } from '../../inventory.service';
import { PerformancePointsFormService, PerformancePointWarnings } from '../performance-points-form.service';
import { CompressorInventoryItemClass } from '../../../../../calculations/CompressorInventoryItemClass';

@Component({
  selector: '[app-turndown]',
  templateUrl: './turndown.component.html',
  styleUrls: ['./turndown.component.css'],
  standalone: false
})
export class TurndownComponent implements OnInit {


  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
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
        this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.turndown.power, compressor);
        if (this.isFormChange == false) {
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.turndown, compressor, 'turndown', compressedAirAssessment.systemInformation);
        } else {
          this.updateForm(this.selectedCompressor.performancePoints.turndown);
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
    let turndown: PerformancePoint = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
    this.compressedAirDataManagementService.updateTurndown(turndown);
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
    if (!this.selectedCompressor.performancePoints.turndown.isDefaultAirFlow) {
      this.showAirflowCalc = (this.selectedCompressor.performancePoints.turndown.airflow != this.defaultCompressor.performancePoints.turndown.airflow);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.turndown.isDefaultPower) {
      this.showPowerCalc = (this.selectedCompressor.performancePoints.turndown.power != this.defaultCompressor.performancePoints.turndown.power);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.turndown.isDefaultPressure) {
      this.showPressureCalc = (this.selectedCompressor.performancePoints.turndown.dischargePressure != this.defaultCompressor.performancePoints.turndown.dischargePressure);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    this.form.controls.airflow.patchValue(this.defaultCompressor.performancePoints.turndown.airflow);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    this.form.controls.power.patchValue(this.defaultCompressor.performancePoints.turndown.power);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    this.form.controls.dischargePressure.patchValue(this.defaultCompressor.performancePoints.turndown.dischargePressure);
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