import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { GenericCompressor, GenericCompressorDbService } from '../../../generic-compressor-db.service';
import { InventoryService } from '../../inventory.service';

@Component({
  selector: 'app-full-load',
  templateUrl: './full-load.component.html',
  styleUrls: ['./full-load.component.css']
})
export class FullLoadComponent implements OnInit {

  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  fullLoadLabel: string;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressorInventoryItem;
  genericCompressor: GenericCompressor;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private genericCompressorDbService: GenericCompressorDbService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.selectedCompressor = val;
        this.genericCompressor = this.genericCompressorDbService.genericCompressors.find(genericCompressor => { return genericCompressor.IDCompLib == this.selectedCompressor.compressorLibId });
        this.checkShowCalc();
        if (this.isFormChange == false) {
          this.setFullLoadLabel(val.compressorControls.controlType);
          this.form = this.inventoryService.getPerformancePointFormFromObj(val.performancePoints.fullLoad);
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
    selectedCompressor.performancePoints.fullLoad = this.inventoryService.getPerformancePointObjFromForm(this.form);
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

  setFullLoadLabel(controlType: number) {
    if (controlType == 1 || controlType == 8 || controlType == 10) {
      this.fullLoadLabel = "";
    } else {
      this.fullLoadLabel = "(cut-in)";
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
      if (!this.selectedCompressor.performancePoints.fullLoad.isDefaultAirFlow) {
        //TODO: use generic or nameplate data?
        //genericCompressor.RatedCapacity
        this.showAirflowCalc = (this.selectedCompressor.performancePoints.fullLoad.airflow != this.selectedCompressor.nameplateData.fullLoadRatedCapacity);
      } else {
        this.showAirflowCalc = false;
      }

      if (!this.selectedCompressor.performancePoints.fullLoad.isDefaultPower) {
        this.showPowerCalc = (this.selectedCompressor.performancePoints.fullLoad.power != this.genericCompressor.TotPackageInputPower);
      } else {
        this.showPowerCalc = false;
      }

      if (!this.selectedCompressor.performancePoints.fullLoad.isDefaultPressure) {
        //TODO: use generic or nameplate data?
        //genericCompressor.RatedPressure
        this.showPressureCalc = (this.selectedCompressor.performancePoints.fullLoad.dischargePressure != this.selectedCompressor.nameplateData.fullLoadOperatingPressure);
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
    //TODO: use generic or nameplate data?
    this.form.controls.airflow.patchValue(this.selectedCompressor.nameplateData.fullLoadRatedCapacity);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    this.form.controls.power.patchValue(this.genericCompressor.TotPackageInputPower);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    //TODO: use generic or nameplate data?
    this.form.controls.dischargePressure.patchValue(this.selectedCompressor.nameplateData.fullLoadOperatingPressure);
    this.form.controls.isDefaultPressure.patchValue(true);
    this.save();
  }

}
