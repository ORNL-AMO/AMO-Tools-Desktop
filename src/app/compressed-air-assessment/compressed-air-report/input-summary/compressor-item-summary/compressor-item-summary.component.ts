import { Component, Input, OnInit } from '@angular/core';
import { CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { InventoryService } from '../../../inventory/inventory.service';
import { PerformancePointsFormService } from '../../../inventory/performance-points/performance-points-form.service';

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
  displayCentrifugalSection: boolean = false;
  constructor(private inventoryService: InventoryService, private performancePointsFormService: PerformancePointsFormService) { }

  ngOnInit(): void {
    this.setDisplayCentrifugalSection();
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  setDisplayCentrifugalSection(){
    this.compressorInventoryItems.forEach(item => {
      if(item.nameplateData.compressorType == 6){
        this.displayCentrifugalSection = true;
      }
    });
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

  checkDisplayBlowdownTime(compressorType: number, controlType: number): boolean {
    return this.inventoryService.checkDisplayBlowdownTime(compressorType, controlType);
  }

  checkDisplayModulation(controlType: number): boolean {
    return this.inventoryService.checkDisplayModulation(controlType);
  }

  checkDisplayNoLoadPowerFM(compressorType: number, controlType: number): boolean {
    return this.inventoryService.checkDisplayNoLoadPowerFM(compressorType, controlType);
  }

  checkDisplayNoLoadPowerUL(compressorType: number, controlType: number): boolean {
    return this.inventoryService.checkDisplayNoLoadPowerUL(compressorType, controlType);
  }

  checkDisplayMaxFullFlow(compressorType: number, controlType: number): boolean {
    return this.performancePointsFormService.checkShowMaxFlowPerformancePoint(compressorType, controlType);
  }
}
