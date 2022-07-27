import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { InventoryService } from '../inventory.service';
import { PerformancePointsFormService } from './performance-points-form.service';

@Component({
  selector: 'app-performance-points',
  templateUrl: './performance-points.component.html',
  styleUrls: ['./performance-points.component.css']
})
export class PerformancePointsComponent implements OnInit {

  selectedCompressorSub: Subscription;
  showMaxFullFlow: boolean;
  showMidTurndown: boolean;
  showTurndown: boolean;
  showUnload: boolean;
  showNoLoad: boolean;
  showBlowoff: boolean;
  contentCollapsed: boolean;
  hasValidPerformancePoints: boolean = true;
  constructor(private inventoryService: InventoryService, private performancePointsFormService: PerformancePointsFormService) { }

  ngOnInit(): void {
    this.contentCollapsed = this.inventoryService.collapsePerformancePoints;
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.hasValidPerformancePoints = this.performancePointsFormService.checkPerformancePointsValid(val);
        this.setShowMidTurndown(val);
        this.setShowTurndown(val);
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
    this.showMaxFullFlow = this.performancePointsFormService.checkShowMaxFlowPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressorControls.controlType);
  }

  setShowMidTurndown(selectedCompressor: CompressorInventoryItem) {
    this.showMidTurndown = this.performancePointsFormService.checkShowMidTurndown(selectedCompressor.compressorControls.controlType);
  }

  setShowTurndown(selectedCompressor: CompressorInventoryItem) {
    this.showTurndown = this.performancePointsFormService.checkShowTurndown(selectedCompressor.compressorControls.controlType);
  }

  setShowUnload(selectedCompressor: CompressorInventoryItem) {
    this.showUnload = this.performancePointsFormService.checkShowUnloadPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressorControls.controlType);
  }

  setShowNoLoad(selectedCompressor: CompressorInventoryItem) {
    this.showNoLoad = this.performancePointsFormService.checkShowNoLoadPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressorControls.controlType);
  }

  setShowBlowoff(selectedCompressor: CompressorInventoryItem) {
    this.showBlowoff = this.performancePointsFormService.checkShowBlowoffPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressorControls.controlType);

  }

  toggleCollapse(){
    this.contentCollapsed = !this.contentCollapsed;
  }
}
