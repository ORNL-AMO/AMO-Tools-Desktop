import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../inventory.service';
import { PerformancePointCalculationsService } from '../performance-points/calculations/performance-point-calculations.service';

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

  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointCalculationsService: PerformancePointCalculationsService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getDesignDetailsFormFromObj(val.designDetails, val.nameplateData.compressorType, val.compressorControls.controlType);
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

  save(updatePerformancePoints?: boolean) {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.designDetails = this.inventoryService.getDesignDetailsObjFromForm(this.form);
    if(updatePerformancePoints){
      selectedCompressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor);
    }
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
    this.displayBlowdownTime = this.inventoryService.checkDisplayBlowdownTime(compressorType, controlType);
  }

  setDisplayUnloadSumpPressure(compressorType: number, controlType: number) {
    this.displayUnloadSumpPressure = this.inventoryService.checkDisplayUnloadSlumpPressure(compressorType, controlType);
  }

  setDisplayModulation(controlType: number) {
    this.displayModulation = this.inventoryService.checkDisplayModulation(controlType);
  }

}
