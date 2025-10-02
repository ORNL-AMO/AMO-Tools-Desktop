import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment } from '../../../../../shared/models/compressed-air-assessment';
import { InventoryService } from '../inventory.service';
import { PerformancePointsFormService } from './performance-points-form.service';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service'
@Component({
    selector: 'app-performance-points',
    templateUrl: './performance-points.component.html',
    styleUrls: ['./performance-points.component.css'],
    standalone: false
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
  constructor(private inventoryService: InventoryService, private performancePointsFormService: PerformancePointsFormService,
    private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.contentCollapsed = this.inventoryService.collapsePerformancePoints;
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(selectedCompressor => {
      if (selectedCompressor) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        this.hasValidPerformancePoints = this.performancePointsFormService.checkPerformancePointsValid(selectedCompressor, compressedAirAssessment.systemInformation);
        this.showBlowoff = selectedCompressor.showBlowoffPoint;
        this.showNoLoad = selectedCompressor.showNoLoadPoint;
        this.showUnload = selectedCompressor.showUnloadPoint;
        this.showTurndown = selectedCompressor.showTurndown;
        this.showMidTurndown = selectedCompressor.showMidTurndown;
        this.showMaxFullFlow = selectedCompressor.showMaxFullFlow;
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.inventoryService.collapsePerformancePoints = this.contentCollapsed;
  }

  toggleCollapse(){
    this.contentCollapsed = !this.contentCollapsed;
  }
}
