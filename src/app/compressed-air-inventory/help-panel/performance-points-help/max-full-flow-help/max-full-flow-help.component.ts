import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../../../compressed-air-inventory-setup/compressed-air-catalog/compressed-air-catalog.service';

@Component({
  selector: 'app-max-full-flow-help',
  standalone: false,
  templateUrl: './max-full-flow-help.component.html',
  styleUrl: './max-full-flow-help.component.css'
})
export class MaxFullFlowHelpComponent {

  focusedField: string;
  focusedFieldSub: Subscription;
  settings: Settings;

  selectedCompressorSub: Subscription;
  maxFullFlowLabel: string;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private compressedAirCatalogService: CompressedAirCatalogService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.focusedFieldSub = this.compressedAirInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });

    this.selectedCompressorSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(val => {
      if (val) {
        this.setMaxFullFlowLabel(val.compressedAirControlsProperties.controlType);
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
