import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-performance-points',
  templateUrl: './performance-points.component.html',
  styleUrls: ['./performance-points.component.css']
})
export class PerformancePointsComponent implements OnInit {

  selectedCompressorSub: Subscription;
  showMaxFullFlow: boolean;
  showUnload: boolean;
  showNoLoad: boolean;
  showBlowoff: boolean;
  contentCollapsed: boolean;
  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.contentCollapsed = this.inventoryService.collapsePerformancePoints;
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.setShowMaxFlow(val);
        this.setShowUnload(val);
        this.setShowNoLoad(val);
        this.setShowBlowoff(val);
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.inventoryService.collapsePerformancePoints = this.contentCollapsed;
  }


  setShowMaxFlow(selectedCompressor: CompressorInventoryItem) {
    this.showMaxFullFlow = this.inventoryService.checkShowMaxFlowPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressorControls.controlType);
  }

  setShowUnload(selectedCompressor: CompressorInventoryItem) {
    this.showUnload = this.inventoryService.checkShowUnloadPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressorControls.controlType);
  }

  setShowNoLoad(selectedCompressor: CompressorInventoryItem) {
    this.showNoLoad = this.inventoryService.checkShowNoLoadPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressorControls.controlType);
  }

  setShowBlowoff(selectedCompressor: CompressorInventoryItem) {
    this.showBlowoff = this.inventoryService.checkShowBlowoffPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressorControls.controlType);

  }

  toggleCollapse(){
    this.contentCollapsed = !this.contentCollapsed;
  }
}
