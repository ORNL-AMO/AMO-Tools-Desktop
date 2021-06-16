import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';
import { PerformancePointCalculationsService } from '../../performance-point-calculations.service';
@Component({
  selector: 'app-max-full-flow',
  templateUrl: './max-full-flow.component.html',
  styleUrls: ['./max-full-flow.component.css']
})
export class MaxFullFlowComponent implements OnInit {


  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  maxFullFlowLabel: string;

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
          this.setMaxFullFlowLabel(val.compressorControls.controlType);
          this.form = this.inventoryService.getPerformancePointFormFromObj(val.performancePoints.maxFullFlow);
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
    selectedCompressor.performancePoints.maxFullFlow = this.inventoryService.getPerformancePointObjFromForm(this.form);
    //re-calculate performance points on changes to max full flow
    selectedCompressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor);
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
    if (this.genericCompressor) {
      if (!this.selectedCompressor.performancePoints.maxFullFlow.isDefaultAirFlow) {
        let expectedAirFlow: number = this.getExpectedAirFlow();
        this.showAirflowCalc = (this.selectedCompressor.performancePoints.maxFullFlow.airflow != expectedAirFlow);
      } else {
        this.showAirflowCalc = false;
      }

      if (!this.selectedCompressor.performancePoints.maxFullFlow.isDefaultPower) {
        let expectedPower: number = this.getExpectedPower();
        this.showPowerCalc = (this.selectedCompressor.performancePoints.maxFullFlow.power != expectedPower);
      } else {
        this.showPowerCalc = false;
      }

      if (!this.selectedCompressor.performancePoints.maxFullFlow.isDefaultPressure) {
        this.showPressureCalc = (this.selectedCompressor.performancePoints.maxFullFlow.dischargePressure != this.genericCompressor.MaxFullFlowPressure);
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
    this.form.controls.dischargePressure.patchValue(this.genericCompressor.MaxFullFlowPressure);
    this.form.controls.isDefaultPressure.patchValue(true);
    this.save();
  }

  getExpectedAirFlow(): number {
    //TODO: use generic or nameplate data?
    return this.performancePointCalculationsService.calculateMaxFullFlowAirFlow(this.selectedCompressor.nameplateData.fullLoadRatedCapacity, this.selectedCompressor.performancePoints.maxFullFlow.dischargePressure, this.selectedCompressor.nameplateData.fullLoadOperatingPressure);
  }

  getExpectedPower(): number {
    //TODO: use generic or nameplate data?
    return this.performancePointCalculationsService.calculateMaxFullFlowPower(this.selectedCompressor.nameplateData.compressorType, this.selectedCompressor.designDetails.inputPressure, this.selectedCompressor.performancePoints.maxFullFlow.dischargePressure, this.selectedCompressor.nameplateData.fullLoadOperatingPressure, this.genericCompressor.TotPackageInputPower);
  }

}
