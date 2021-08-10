import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../inventory.service';
import { PerformancePointCalculationsService } from '../performance-points/calculations/performance-point-calculations.service';

@Component({
  selector: 'app-inlet-conditions',
  templateUrl: './inlet-conditions.component.html',
  styleUrls: ['./inlet-conditions.component.css']
})
export class InletConditionsComponent implements OnInit {

  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  contentCollapsed: boolean;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointCalculationsService: PerformancePointCalculationsService) { }

  ngOnInit(): void {
    this.contentCollapsed = this.inventoryService.collapseInletConditions;
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getInletConditionsFormFromObj(val.inletConditions);
        } else {
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy(){
    this.selectedCompressorSub.unsubscribe();
    this.inventoryService.collapseInletConditions = this.contentCollapsed;
  }

  save() {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.inletConditions = this.inventoryService.getInletConditionsObjFromForm(this.form);
    selectedCompressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
    compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    compressedAirAssessment.modifications.forEach(modification => {
      let adjustedCompressorIndex: number = modification.useUnloadingControls.adjustedCompressors.findIndex(adjustedCompressor => {
        return adjustedCompressor.compressorId == selectedCompressor.itemId;
      });
      modification.useUnloadingControls.adjustedCompressors[adjustedCompressorIndex] = {
        selected: false,
        compressorId: selectedCompressor.itemId,
        originalControlType: selectedCompressor.compressorControls.controlType,
        compressorType: selectedCompressor.nameplateData.compressorType,
        unloadPointCapacity: selectedCompressor.compressorControls.unloadPointCapacity,
        controlType: selectedCompressor.compressorControls.controlType,
        performancePoints: selectedCompressor.performancePoints,
        automaticShutdown: selectedCompressor.compressorControls.automaticShutdown
      }
    });
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(selectedCompressor);
  }

  focusField(str: string){
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  toggleCollapse(){
    this.contentCollapsed = !this.contentCollapsed;
  }

}
