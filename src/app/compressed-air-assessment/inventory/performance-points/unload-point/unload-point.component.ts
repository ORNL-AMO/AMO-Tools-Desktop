import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';
import { PerformancePointCalculationsService } from '../../performance-point-calculations.service';

@Component({
  selector: 'app-unload-point',
  templateUrl: './unload-point.component.html',
  styleUrls: ['./unload-point.component.css']
})
export class UnloadPointComponent implements OnInit {
  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressorInventoryItem;
  genericCompressor: GenericCompressor;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private genericCompressorDbService: GenericCompressorDbService, private performancePointCalculationsService: PerformancePointCalculationsService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.selectedCompressor = val;
        this.genericCompressor = this.genericCompressorDbService.genericCompressors.find(genericCompressor => { return genericCompressor.IDCompLib == this.selectedCompressor.compressorLibId });
        this.checkShowCalc();
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getPerformancePointFormFromObj(val.performancePoints.unloadPoint);
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
    selectedCompressor.performancePoints.unloadPoint = this.inventoryService.getPerformancePointObjFromForm(this.form);
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
    if (this.genericCompressor) {
      if (!this.selectedCompressor.performancePoints.unloadPoint.isDefaultAirFlow) {
        let expectedAirFlow: number = this.getExpectedAirFlow();
        this.showAirflowCalc = (this.selectedCompressor.performancePoints.unloadPoint.airflow != expectedAirFlow);
      } else {
        this.showAirflowCalc = false;
      }

      if (!this.selectedCompressor.performancePoints.unloadPoint.isDefaultPower) {
        let expectedPower: number = this.getExpectedPower();
        this.showPowerCalc = (this.selectedCompressor.performancePoints.unloadPoint.power != expectedPower);
      } else {
        this.showPowerCalc = false;
      }

      if (!this.selectedCompressor.performancePoints.unloadPoint.isDefaultPressure) {
        let expectedPressure: number = this.getExpectedPressure();
        this.showPressureCalc = (this.selectedCompressor.performancePoints.unloadPoint.dischargePressure != expectedPressure);
      } else {
        this.showPressureCalc = false;
      }
    } else {
      this.showAirflowCalc = false;
      this.showPowerCalc = false;
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let expectedAirFlow: number = this.getExpectedAirFlow();
    this.form.controls.airflow.patchValue(expectedAirFlow);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let expectedPower: number = this.getExpectedPower();
    this.form.controls.power.patchValue(expectedPower);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let expectedPressure: number = this.getExpectedPressure();
    this.form.controls.dischargePressure.patchValue(expectedPressure);
    this.form.controls.isDefaultPressure.patchValue(true);
    this.save();
  }

  getExpectedPower(): number {
    //TODO: use generic or nameplate data?
    if (this.selectedCompressor.compressorControls.controlType == 3) {
      return this.performancePointCalculationsService.calculateUnloadPointPower(this.genericCompressor.NoLoadPowerFM, this.selectedCompressor.compressorControls.unloadPointCapacity, 2, this.selectedCompressor.performancePoints.maxFullFlow.power);
    } else if (this.selectedCompressor.compressorControls.controlType == 2) {
      return this.performancePointCalculationsService.calculateUnloadPointPower(this.genericCompressor.NoLoadPowerFM, this.selectedCompressor.compressorControls.unloadPointCapacity, 1, this.selectedCompressor.performancePoints.maxFullFlow.power);
    }
  }

  getExpectedPressure(): number {
    //TODO: use generic or nameplate data?
    return this.performancePointCalculationsService.calculateUnloadPointDischargePressure(this.genericCompressor.MaxFullFlowPressure, this.selectedCompressor.designDetails.modulatingPressureRange, this.selectedCompressor.compressorControls.unloadPointCapacity);
  }

  getExpectedAirFlow(): number {
    //TODO: use generic or nameplate data?
    return this.performancePointCalculationsService.calculateUnloadPointAirFlow(this.selectedCompressor.nameplateData.fullLoadRatedCapacity, this.selectedCompressor.compressorControls.unloadPointCapacity);
  }
}
