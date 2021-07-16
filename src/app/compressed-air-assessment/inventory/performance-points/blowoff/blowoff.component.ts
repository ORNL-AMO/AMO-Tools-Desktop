import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, PerformancePoint } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { InventoryService } from '../../inventory.service';
import { BlowoffCalculationsService } from '../calculations/blowoff-calculations.service';
import { PerformancePointCalculationsService } from '../calculations/performance-point-calculations.service';

@Component({
  selector: 'app-blowoff',
  templateUrl: './blowoff.component.html',
  styleUrls: ['./blowoff.component.css']
})
export class BlowoffComponent implements OnInit {
  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressorInventoryItem;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService, private blowoffCalculationsService: BlowoffCalculationsService,
    private performancePointCalculationsService: PerformancePointCalculationsService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.selectedCompressor = val;
        this.checkShowCalc();
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getPerformancePointFormFromObj(val.performancePoints.blowoff);
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
    selectedCompressor.performancePoints.blowoff = this.inventoryService.getPerformancePointObjFromForm(this.form);
    selectedCompressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor);
    this.updateForm(selectedCompressor.performancePoints.blowoff);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
    compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(selectedCompressor);
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
