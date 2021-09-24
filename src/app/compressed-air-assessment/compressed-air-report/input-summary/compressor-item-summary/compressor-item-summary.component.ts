import { Component, Input, OnInit } from '@angular/core';
import { CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { InventoryService } from '../../../inventory/inventory.service';

@Component({
  selector: 'app-compressor-item-summary',
  templateUrl: './compressor-item-summary.component.html',
  styleUrls: ['./compressor-item-summary.component.css']
})
export class CompressorItemSummaryComponent implements OnInit {
  @Input()
  compressorInventoryItems: Array<CompressorInventoryItem>;
  @Input()
  printView: boolean;
  @Input()
  settings: Settings;

  collapse: boolean = false;
  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  checkDisplayUnloadCapacity(controlType: number): boolean {
    return this.inventoryService.checkDisplayUnloadCapacity(controlType);
  }

  checkDisplayAutomaticShutdown(controlType: number): boolean {
    return this.inventoryService.checkDisplayAutomaticShutdown(controlType);
  }

  checkDisplayUnloadSumpPressure(compressorType: number): boolean {
    return this.inventoryService.checkDisplayUnloadSlumpPressure(compressorType);
  }
}
