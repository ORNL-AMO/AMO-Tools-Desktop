import { Component, OnInit } from '@angular/core';
import { BatchAnalysisService } from './batch-analysis.service';
import { Subscription } from 'rxjs';
import { MotorInventoryService } from '../motor-inventory.service';

@Component({
    selector: 'app-batch-analysis',
    templateUrl: './batch-analysis.component.html',
    styleUrls: ['./batch-analysis.component.css'],
    standalone: false
})
export class BatchAnalysisComponent implements OnInit {

  selectedTab: string;
  selectedTabSub: Subscription;
  filterInventorySummarySub: Subscription;
  constructor(private batchAnalysisService: BatchAnalysisService, private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.selectedTabSub = this.batchAnalysisService.selectedTab.subscribe(val => {
      this.selectedTab = val;
    });

    this.filterInventorySummarySub = this.motorInventoryService.filterInventorySummary.subscribe(() => {
      this.batchAnalysisService.setBatchAnalysisDataItems();
    });
  }

  ngOnDestroy() {
    this.selectedTabSub.unsubscribe();
    this.filterInventorySummarySub.unsubscribe();
  }
}


