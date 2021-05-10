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

  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
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
  }


  setShowMaxFlow(selectedCompressor: CompressorInventoryItem) {
    if (selectedCompressor.nameplateData.compressorType == 6) {
      this.showMaxFullFlow = false;
    } else if (selectedCompressor.nameplateData.compressorType == 1 || selectedCompressor.nameplateData.compressorType == 2) {
      if (selectedCompressor.compressorControls.controlType == 1) {
        this.showMaxFullFlow = false;
      } else {
        this.showMaxFullFlow = true;
      }
    } else {
      this.showMaxFullFlow = true;
    }
  }

  setShowUnload(selectedCompressor: CompressorInventoryItem) {
    if (selectedCompressor.nameplateData.compressorType == 1 || selectedCompressor.nameplateData.compressorType == 2) {
      if (selectedCompressor.compressorControls.controlType == 2 || selectedCompressor.compressorControls.controlType == 3) {
        this.showUnload = true;
      } else {
        this.showUnload = false;
      }
    } else {
      this.showUnload = false;
    }
  }

  setShowNoLoad(selectedCompressor: CompressorInventoryItem) {
    if (selectedCompressor.nameplateData.compressorType != 6) {
      this.showNoLoad = true;
    } else {
      if(selectedCompressor.compressorControls.controlType == 8 || selectedCompressor.compressorControls.controlType == 10){
        this.showNoLoad = false
      }else{
        this.showNoLoad = true;
      }
    }

  }

  setShowBlowoff(selectedCompressor: CompressorInventoryItem) {
    //centrifugal
    if (selectedCompressor.nameplateData.compressorType == 6) {
      //"with blowoff"
      if (selectedCompressor.compressorControls.controlType == 8 || selectedCompressor.compressorControls.controlType == 10) {
        this.showBlowoff = true;
      } else {
        this.showBlowoff = false;
      }
    } else {
      this.showBlowoff = false;
    }

  }
}
