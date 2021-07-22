import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../inventory.service';
import { PerformancePointCalculationsService } from '../performance-points/calculations/performance-point-calculations.service';

@Component({
  selector: 'app-centrifugal-specifics',
  templateUrl: './centrifugal-specifics.component.html',
  styleUrls: ['./centrifugal-specifics.component.css']
})
export class CentrifugalSpecificsComponent implements OnInit {

  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  constructor(private inventoryService: InventoryService, 
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointCalculationsService: PerformancePointCalculationsService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getCentrifugalFormFromObj(compressor);
        } else {
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy(){
    this.selectedCompressorSub.unsubscribe();
  }

  save() {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.modifiedDate = new Date();
    selectedCompressor.centrifugalSpecifics = this.inventoryService.getCentrifugalObjFromForm(this.form);
    selectedCompressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(selectedCompressor);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
    compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(selectedCompressor);
  }

  focusField(str: string){
    this.compressedAirAssessmentService.focusedField.next(str);
  }
}
