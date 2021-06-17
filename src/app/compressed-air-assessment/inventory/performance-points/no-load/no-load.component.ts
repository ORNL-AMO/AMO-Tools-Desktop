import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';
import { PerformancePointCalculationsService } from '../../performance-point-calculations.service';

@Component({
  selector: 'app-no-load',
  templateUrl: './no-load.component.html',
  styleUrls: ['./no-load.component.css']
})
export class NoLoadComponent implements OnInit {
  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  noLoadLabel: string;

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
          this.setNoLoadLabel(val.compressorControls.controlType);
          this.form = this.inventoryService.getPerformancePointFormFromObj(val.performancePoints.noLoad);
          // this.form.controls.airflow.disable();
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
    selectedCompressor.performancePoints.noLoad = this.inventoryService.getPerformancePointObjFromForm(this.form);
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

  setNoLoadLabel(controlType: number) {
    if (controlType == 4 || controlType == 7 || controlType == 2 || controlType == 3 || controlType == 9 || controlType == 11) {
      this.noLoadLabel = "(unloaded)";
    } else if (controlType == 6) {
      this.noLoadLabel = "(off)";
    } else if (controlType == 1) {
      this.noLoadLabel = "(modulated)";
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
      if (!this.selectedCompressor.performancePoints.noLoad.isDefaultAirFlow) {
        this.showAirflowCalc = (this.selectedCompressor.performancePoints.noLoad.airflow != 0);
      } else {
        this.showAirflowCalc = false;
      }

      if (!this.selectedCompressor.performancePoints.noLoad.isDefaultPower) {
        let expectedPower: number = this.getExpectedPower();
        this.showPowerCalc = (this.selectedCompressor.performancePoints.noLoad.power != expectedPower);
      } else {
        this.showPowerCalc = false;
      }

      if (!this.selectedCompressor.performancePoints.noLoad.isDefaultPressure) {
        let expectedPressure: number = this.getExpectedPressure();
        this.showPressureCalc = (this.selectedCompressor.performancePoints.noLoad.dischargePressure != expectedPressure);
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
    this.form.controls.airflow.patchValue(0);
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
    if(this.selectedCompressor.compressorControls.controlType != 1){
      return this.performancePointCalculationsService.calculateNoLoadPower(this.genericCompressor.NoLoadPowerUL, this.genericCompressor.TotPackageInputPower, this.selectedCompressor.designDetails.designEfficiency);
    }else{
       return this.performancePointCalculationsService.calculateNoLoadPowerWithoutUnloading(this.genericCompressor);
    }
  }

  getExpectedPressure(): number{
    return this.performancePointCalculationsService.getNoLoadDischargePressure(this.selectedCompressor, this.genericCompressor);
  }

}
