import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../../compressed-air-data-management.service';
import { InventoryService } from '../../inventory.service';
import { PerformancePointCalculationsService } from '../calculations/performance-point-calculations.service';
import { UnloadPointCalculationsService } from '../calculations/unload-point-calculations.service';
import { PerformancePointsFormService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-form.service';

@Component({
  selector: '[app-unload-point]',
  templateUrl: './unload-point.component.html',
  styleUrls: ['./unload-point.component.css']
})
export class UnloadPointComponent implements OnInit {
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
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointsFormService: PerformancePointsFormService,
    private unloadPointCalculationsService: UnloadPointCalculationsService, private performancePointCalculationsService: PerformancePointCalculationsService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.unloadPoint.power, compressor);
        if (this.isFormChange == false) {
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.unloadPoint, compressor, 'unloadPoint', this.inModification);
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
  }

  save() {
    this.isFormChange = true;
    if (!this.inModification) {
      let unloadPoint: PerformancePoint = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
      this.compressedAirDataManagementService.updateUnloadPoint(unloadPoint);
    } else {
      let unloadPoint: PerformancePoint = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
      this.selectedCompressor.performancePoints.unloadPoint = unloadPoint;
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
    if(this.inModification){
      this.compressedAirAssessmentService.focusedField.next('useUnloadingControls');
      this.compressedAirAssessmentService.helpTextField.next(str);
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
