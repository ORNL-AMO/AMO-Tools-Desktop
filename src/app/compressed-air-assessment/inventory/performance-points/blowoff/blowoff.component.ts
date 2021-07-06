import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';
import { BlowoffCalculationsService } from '../calculations/blowoff-calculations.service';

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
  genericCompressor: GenericCompressor;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private genericCompressorDbService: GenericCompressorDbService, private blowoffCalculationsService: BlowoffCalculationsService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.selectedCompressor = val;
        this.genericCompressor = this.genericCompressorDbService.genericCompressors.find(genericCompressor => { return genericCompressor.IDCompLib == this.selectedCompressor.compressorLibId });
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
      if (!this.selectedCompressor.performancePoints.blowoff.isDefaultAirFlow) {
        let defaultValue: number = this.blowoffCalculationsService.getBlowoffAirFlow(this.selectedCompressor, true);
        this.showAirflowCalc = (this.selectedCompressor.performancePoints.blowoff.airflow != defaultValue);
      } else {
        this.showAirflowCalc = false;
      }

      if (!this.selectedCompressor.performancePoints.blowoff.isDefaultPower) {
        let defaultValue: number = this.blowoffCalculationsService.getBlowoffPower(this.selectedCompressor, this.genericCompressor, true);
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
    } else {
      this.showAirflowCalc = false;
      this.showPowerCalc = false;
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
    let defaultValue: number = this.blowoffCalculationsService.getBlowoffPower(this.selectedCompressor, this.genericCompressor, true);
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

}
