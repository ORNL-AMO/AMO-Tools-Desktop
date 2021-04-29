import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-design-details',
  templateUrl: './design-details.component.html',
  styleUrls: ['./design-details.component.css']
})
export class DesignDetailsComponent implements OnInit {

  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  displayBlowdownTime: boolean;
  displayUnloadSumpPressure: boolean;
  displayModulation: boolean;

  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getDesignDetailsFormFromObj(val.designDetails);
          this.setDisplayBlowdownTime(val.nameplateData.compressorType, val.compressorControls.controlType);
          this.setDisplayUnloadSumpPressure(val.nameplateData.compressorType, val.compressorControls.controlType);
          this.setDisplayModulation(val.compressorControls.controlType)

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
    selectedCompressor.designDetails = this.inventoryService.getDesignDetailsObjFromForm(this.form);
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

  setDisplayBlowdownTime(compressorType: number, controlType: number) {
    //"lubricant-injected rotary screws"
    if (compressorType == 1 || compressorType == 2) {
      //has word "unloading"
      if (controlType == 1 || controlType == 2 || controlType == 3) {
        this.displayBlowdownTime = true;
      } else {
        this.displayBlowdownTime = false;
      }
    } else {
      this.displayBlowdownTime = false;
    }
  }

  setDisplayUnloadSumpPressure(compressorType: number, controlType: number) {
    //"lubricant-injected rotary screws"
    //controlType "load/unload"
    if ((compressorType == 1 || compressorType == 2) && controlType == 4) {
      this.displayUnloadSumpPressure = true;
    } else {
      this.displayUnloadSumpPressure = false;
    }
  }

  setDisplayModulation(controlType: number) {
    //any control type with "modulation"
    if (controlType == 1 || controlType == 2 || controlType == 8 || controlType == 9 || controlType == 10 || controlType == 11) {
      this.displayModulation = true;
    } else {
      this.displayModulation = false;
    }
  }

}
