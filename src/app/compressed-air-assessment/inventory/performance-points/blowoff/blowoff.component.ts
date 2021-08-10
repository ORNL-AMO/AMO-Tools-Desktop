import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../../compressed-air-data-management.service';
import { InventoryService } from '../../inventory.service';
import { BlowoffCalculationsService } from '../calculations/blowoff-calculations.service';
import { PerformancePointCalculationsService } from '../calculations/performance-point-calculations.service';
import { PerformancePointsFormService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-form.service';

@Component({
  selector: '[app-blowoff]',
  templateUrl: './blowoff.component.html',
  styleUrls: ['./blowoff.component.css']
})
export class BlowoffComponent implements OnInit {
  @Input()
  inModification: boolean;


  selectedCompressorSub: Subscription;
  form: FormGroup;
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
    private performancePointCalculationsService: PerformancePointCalculationsService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.blowoff.power, compressor);
        if (this.isFormChange == false) {
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.blowoff, compressor, 'blowoff', this.inModification);
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
    if (!this.inModification) {
      let blowoff: PerformancePoint = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
      this.compressedAirDataManagementService.updateBlowoff(blowoff)
    } else {
      let blowoff: PerformancePoint = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
      this.selectedCompressor.performancePoints.blowoff = blowoff;
      this.selectedCompressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(this.selectedCompressor);
      let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
      let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
      let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
      let adjustedCompressorIndex: number = compressedAirAssessment.modifications[modificationIndex].useUnloadingControls.adjustedCompressors.findIndex(adjustedCompressor => { return adjustedCompressor.compressorId == this.selectedCompressor.itemId });
      compressedAirAssessment.modifications[modificationIndex].useUnloadingControls.adjustedCompressors[adjustedCompressorIndex].performancePoints = this.selectedCompressor.performancePoints;
      this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    }
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
      let defaultValue: number = this.blowoffCalculationsService.getBlowoffAirFlow(this.selectedCompressor, true);
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
      let defaultValue: number = this.blowoffCalculationsService.getBlowoffDischargePressure(this.selectedCompressor, true);
      this.showPressureCalc = (this.selectedCompressor.performancePoints.blowoff.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.blowoffCalculationsService.getBlowoffAirFlow(this.selectedCompressor, true);
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
    let defaultValue: number = this.blowoffCalculationsService.getBlowoffDischargePressure(this.selectedCompressor, true);
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
