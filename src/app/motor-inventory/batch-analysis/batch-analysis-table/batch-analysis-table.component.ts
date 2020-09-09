import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BatchAnalysisService, BatchAnalysisSettings, BatchAnalysisResults } from '../batch-analysis.service';

@Component({
  selector: 'app-batch-analysis-table',
  templateUrl: './batch-analysis-table.component.html',
  styleUrls: ['./batch-analysis-table.component.css']
})
export class BatchAnalysisTableComponent implements OnInit {

  batchAnalysisDataItems: Array<BatchAnalysisResults>;
  batchAnalysisDataItemsSub: Subscription;
  sortByField: string = 'motorName';
  sortByDirection: string = 'desc';
  batchAnalysisSettings: BatchAnalysisSettings;
  batchAnalysisSettingsSub: Subscription;
  constructor(private batchAnalysisService: BatchAnalysisService) { }

  ngOnInit(): void {
    this.batchAnalysisSettingsSub = this.batchAnalysisService.batchAnalysisSettings.subscribe(val => {
      this.batchAnalysisSettings = val;
    });

    this.batchAnalysisDataItemsSub = this.batchAnalysisService.batchAnalysisDataItems.subscribe(val => {
      this.batchAnalysisDataItems = val;
    });
  }

  ngOnDestroy() {
    this.batchAnalysisDataItemsSub.unsubscribe();
    this.batchAnalysisSettingsSub.unsubscribe();
  }

  setSortByField(str: string) {
    if (this.sortByField == str) {
      if (this.sortByDirection == 'desc') {
        this.sortByDirection = 'asc';
      } else {
        this.sortByDirection = 'desc';
      }
    }
    this.sortByField = str;
  }

}

