import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';
import { InventoryService } from '../../../../../baseline-tab-content/inventory-setup/inventory/inventory.service';

@Component({
    selector: 'app-max-full-flow-help',
    templateUrl: './max-full-flow-help.component.html',
    styleUrls: ['./max-full-flow-help.component.css'],
    standalone: false
})
export class MaxFullFlowHelpComponent implements OnInit {

  helpTextField: string;
  helpTextFieldSub: Subscription;
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

    this.helpTextFieldSub = this.compressedAirService.helpTextField.subscribe(val => {
      this.helpTextField = val;
    });
  }

  ngOnDestroy() {
    this.focusedFieldSub.unsubscribe();
    this.selectedCompressorSub.unsubscribe();
    this.helpTextFieldSub.unsubscribe();
  }

  setMaxFullFlowLabel(controlType: number) {
    if (controlType == 2 || controlType == 3) {
      this.maxFullFlowLabel = "(mod begins)";
    } else {
      this.maxFullFlowLabel = "(cut-out)";
    }
  }

}
