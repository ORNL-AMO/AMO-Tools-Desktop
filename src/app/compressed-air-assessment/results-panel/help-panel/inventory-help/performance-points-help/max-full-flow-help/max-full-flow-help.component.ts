import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';
import { InventoryService } from '../../../../../inventory/inventory.service';

@Component({
  selector: 'app-max-full-flow-help',
  templateUrl: './max-full-flow-help.component.html',
  styleUrls: ['./max-full-flow-help.component.css']
})
export class MaxFullFlowHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;
  selectedCompressorSub: Subscription;
  maxFullFlowLabel: string;
  constructor(private compressedAirService: CompressedAirAssessmentService, private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.compressedAirService.focusedField.subscribe(val => {
      this.focusedField = val;      
    });

    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.setMaxFullFlowLabel(val.compressorControls.controlType);
      }
    });
  }

  ngOnDestroy() {
    this.focusedFieldSub.unsubscribe();
    this.selectedCompressorSub.unsubscribe();

  }

  setMaxFullFlowLabel(controlType: number) {
    if (controlType == 2 || controlType == 3) {
      this.maxFullFlowLabel = "(mod begins)";
    } else {
      this.maxFullFlowLabel = "(cut-out)";
    }
  }

}
