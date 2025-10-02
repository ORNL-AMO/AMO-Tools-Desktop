import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';
import { InventoryService } from '../../../../../baseline-tab-content/inventory-setup/inventory/inventory.service';

@Component({
    selector: 'app-full-load-help',
    templateUrl: './full-load-help.component.html',
    styleUrls: ['./full-load-help.component.css'],
    standalone: false
})
export class FullLoadHelpComponent implements OnInit {

  helpTextField: string;
  helpTextFieldSub: Subscription;
  focusedField: string;
  focusedFieldSub: Subscription;
  selectedCompressorSub: Subscription;
  fullLoadLabel: string;
  constructor(private compressedAirService: CompressedAirAssessmentService, private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.compressedAirService.focusedField.subscribe(val => {
      this.focusedField = val;
    });

    this.helpTextFieldSub = this.compressedAirService.helpTextField.subscribe(val => {
      this.helpTextField = val;
    });

    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {  
          this.setFullLoadLabel(val.compressorControls.controlType);
      }
    });

  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
    this.helpTextFieldSub.unsubscribe();
    this.selectedCompressorSub.unsubscribe();
  }

  setFullLoadLabel(controlType: number) {
    if (controlType == 1 || controlType == 7 || controlType == 9) {
      this.fullLoadLabel = "";
    } else {
      this.fullLoadLabel = "(cut-in)";
    }
  }

}
