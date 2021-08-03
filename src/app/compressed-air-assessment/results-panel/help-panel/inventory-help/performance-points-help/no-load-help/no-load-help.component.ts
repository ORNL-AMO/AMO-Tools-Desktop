import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';
import { InventoryService } from '../../../../../inventory/inventory.service';

@Component({
  selector: 'app-no-load-help',
  templateUrl: './no-load-help.component.html',
  styleUrls: ['./no-load-help.component.css']
})
export class NoLoadHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;

  selectedCompressorSub: Subscription;
  noLoadLabel: string;

  constructor(private compressedAirService: CompressedAirAssessmentService, private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.compressedAirService.focusedField.subscribe(val => {
      this.focusedField = val;
    });

    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.setNoLoadLabel(val.compressorControls.controlType);
      }
    })

  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
    this.selectedCompressorSub.unsubscribe();
  }

  setNoLoadLabel(controlType: number) {
    if (controlType == 4 || controlType == 6 || controlType == 2 || controlType == 3 || controlType == 8 || controlType == 10) {
      this.noLoadLabel = "(unloaded)";
    } else if (controlType == 5) {
      this.noLoadLabel = "(off)";
    } else if (controlType == 1) {
      this.noLoadLabel = "(modulated)";
    }
  }

}
