import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
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
  @Input()
  inModification: boolean;

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
  constructor(private inventoryService: InventoryService,
    private performancePointsFormService: PerformancePointsFormService,
    private compressedAirAssessmentService: CompressedAirAssessmentService, private performancePointCalculationsService: PerformancePointCalculationsService,
    private maxFullFlowCalculationsService: MaxFullFlowCalculationsService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        if (this.isFormChange == false) {
          this.setMaxFullFlowLabel(compressor.compressorControls.controlType);
          this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.maxFullFlow.power, compressor);
          this.form = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.maxFullFlow, compressor, 'maxFullFlow', this.inModification);
          this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  save() {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.performancePoints.maxFullFlow = this.performancePointsFormService.getPerformancePointObjFromForm(this.form);
    this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(selectedCompressor.performancePoints.maxFullFlow.power, selectedCompressor);
    //re-calculate performance points on changes to max full flow
    selectedCompressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor);
    this.updateForm(selectedCompressor.performancePoints.maxFullFlow);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (!this.inModification) {
      let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
      compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    } else {
      let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
      let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
      let adjustedCompressorIndex: number = compressedAirAssessment.modifications[modificationIndex].useUnloadingControls.adjustedCompressors.findIndex(adjustedCompressor => { return adjustedCompressor.compressorId == selectedCompressor.itemId });
      compressedAirAssessment.modifications[modificationIndex].useUnloadingControls.adjustedCompressors[adjustedCompressorIndex].performancePoints = selectedCompressor.performancePoints;
    }
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(selectedCompressor);
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
      let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowAirFlow(this.selectedCompressor, true);
      this.showAirflowCalc = (this.selectedCompressor.performancePoints.maxFullFlow.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
      let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowPower(this.selectedCompressor, true);
      this.showPowerCalc = (this.selectedCompressor.performancePoints.maxFullFlow.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
      let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowPressure(this.selectedCompressor, true);
      this.showPressureCalc = (this.selectedCompressor.performancePoints.maxFullFlow.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowAirFlow(this.selectedCompressor, true);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowPower(this.selectedCompressor, true);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.maxFullFlowCalculationsService.getMaxFullFlowPressure(this.selectedCompressor, true);
    this.form.controls.dischargePressure.patchValue(defaultValue);
    this.form.controls.isDefaultPressure.patchValue(true);
    this.save();
  }
  updateForm(performancePoint: PerformancePoint){
    if(performancePoint.airflow != this.form.controls.airflow.value){
      this.form.controls.airflow.patchValue(performancePoint.airflow);
    }
    if(performancePoint.dischargePressure != this.form.controls.dischargePressure.value){
      this.form.controls.dischargePressure.patchValue(performancePoint.dischargePressure);
    }
    if(performancePoint.power != this.form.controls.power.value){
      this.form.controls.power.patchValue(performancePoint.power);
    }
  }
}
