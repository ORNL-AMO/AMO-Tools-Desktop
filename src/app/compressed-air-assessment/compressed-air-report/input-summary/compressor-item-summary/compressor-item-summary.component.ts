import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { InventoryService } from '../../../inventory/inventory.service';
import { PerformancePointsFormService } from '../../../inventory/performance-points/performance-points-form.service';

@Component({
    selector: 'app-compressor-item-summary',
    templateUrl: './compressor-item-summary.component.html',
    styleUrls: ['./compressor-item-summary.component.css'],
    standalone: false
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
  showMaxFullFlow: boolean = false;
  showUnloadPoint: boolean = false;
  showNoLoad: boolean = false;
  showBlowoff: boolean = false;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;
  
  constructor(private inventoryService: InventoryService, private performancePointsFormService: PerformancePointsFormService) { }

  ngOnInit(): void {
    this.setDisplayCentrifugalSection();
    this.setDisplayPerformancePoints();
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  setDisplayCentrifugalSection() {
    this.compressorInventoryItems.forEach(item => {
      if (item.nameplateData.compressorType == 6) {
        this.displayCentrifugalSection = true;
      }
    });
  }

  setDisplayPerformancePoints() {
    this.compressorInventoryItems.forEach(item => {
      let showMaxFullFlow: boolean = this.checkShowMaxFlowPerformancePoint(item.nameplateData.compressorType, item.compressorControls.controlType);
      if (showMaxFullFlow) {
        this.showMaxFullFlow = showMaxFullFlow;
      }
      let showUnloadPoint: boolean = this.checkShowUnloadPerformancePoint(item.nameplateData.compressorType, item.compressorControls.controlType);
      if (showUnloadPoint) {
        this.showUnloadPoint = showUnloadPoint;
      }
      let showNoLoad: boolean = this.checkShowNoLoadPerformancePoint(item.nameplateData.compressorType, item.compressorControls.controlType);
      if (showNoLoad) {
        this.showNoLoad = showNoLoad;
      }
      let showBlowoff: boolean = this.checkShowBlowoffPerformancePoint(item.nameplateData.compressorType, item.compressorControls.controlType);
      if (showBlowoff) {
        this.showBlowoff = showBlowoff;
      }
    });
  }


  checkDisplayUnloadCapacity(controlType: number): boolean {
    return this.inventoryService.checkDisplayUnloadCapacity(controlType);
  }

  checkDisplayAutomaticShutdown(controlType: number): boolean {
    return this.inventoryService.checkDisplayAutomaticShutdown(controlType);
  }

  checkDisplayUnloadSumpPressure(compressorType: number, controlType: number): boolean {
    return this.inventoryService.checkDisplayUnloadSlumpPressure(compressorType, controlType);
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

  checkShowMaxFlowPerformancePoint(compressorType: number, controlType: number): boolean {
    return this.performancePointsFormService.checkShowMaxFlowPerformancePoint(compressorType, controlType)
  }

  checkShowUnloadPerformancePoint(compressorType: number, controlType: number): boolean {
    return this.performancePointsFormService.checkShowUnloadPerformancePoint(compressorType, controlType)
  }

  checkShowNoLoadPerformancePoint(compressorType: number, controlType: number): boolean {
    return this.performancePointsFormService.checkShowNoLoadPerformancePoint(compressorType, controlType)
  }

  checkShowBlowoffPerformancePoint(compressorType: number, controlType: number): boolean {
    return this.performancePointsFormService.checkShowBlowoffPerformancePoint(compressorType, controlType)
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

}
