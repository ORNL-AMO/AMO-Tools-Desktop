import { Component } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../../../compressed-air-inventory-setup/compressed-air-catalog/compressed-air-catalog.service';

@Component({
  selector: 'app-no-load-help',
  standalone: false,
  templateUrl: './no-load-help.component.html',
  styleUrl: './no-load-help.component.css'
})
export class NoLoadHelpComponent {

  focusedField: string;
  focusedFieldSub: Subscription;
  settings: Settings;

  
  selectedCompressorSub: Subscription;
  noLoadLabel: string;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private compressedAirCatalogService: CompressedAirCatalogService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.focusedFieldSub = this.compressedAirInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });

    this.selectedCompressorSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(val => {
      if (val) {
        this.setNoLoadLabel(val.compressedAirControlsProperties.controlType);
      }
    });
  }

  ngOnDestroy() {
    this.focusedFieldSub.unsubscribe();
    this.selectedCompressorSub.unsubscribe();
  }

  setNoLoadLabel(controlType: number) {
    if (controlType == 4 || controlType == 5 || controlType == 2 || controlType == 3 || controlType == 8 || controlType == 10) {
      this.noLoadLabel = "(unloaded)";
    } else if (controlType == 6) {
      this.noLoadLabel = "(off)";
    } else if (controlType == 1) {
      this.noLoadLabel = "(modulated)";
    }
  }


}
