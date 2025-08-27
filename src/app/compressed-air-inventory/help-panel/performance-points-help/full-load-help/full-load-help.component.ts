import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../../../compressed-air-inventory-setup/compressed-air-catalog/compressed-air-catalog.service';

@Component({
  selector: 'app-full-load-help',
  standalone: false,
  templateUrl: './full-load-help.component.html',
  styleUrl: './full-load-help.component.css'
})
export class FullLoadHelpComponent {

  focusedField: string;
  focusedFieldSub: Subscription;
  settings: Settings;
  
  selectedCompressorSub: Subscription;
  fullLoadLabel: string;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private compressedAirCatalogService: CompressedAirCatalogService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.focusedFieldSub = this.compressedAirInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });

    this.selectedCompressorSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(val => {
      if (val) {
        this.setFullLoadLabel(val.compressedAirControlsProperties.controlType);
      }
    });
  }

  ngOnDestroy() {
    this.focusedFieldSub.unsubscribe();
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
