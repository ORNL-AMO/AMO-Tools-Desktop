import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-inlet-conditions',
  templateUrl: './inlet-conditions.component.html',
  styleUrls: ['./inlet-conditions.component.css']
})
export class InletConditionsComponent implements OnInit {

  selectedCompressorSub: Subscription;
  form: FormGroup;
  isFormChange: boolean = false;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
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
  }

  save() {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.inletConditions = this.inventoryService.getInletConditionsObjFromForm(this.form);
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
