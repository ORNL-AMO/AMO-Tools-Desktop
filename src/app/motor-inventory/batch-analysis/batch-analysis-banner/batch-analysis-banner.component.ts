import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BatchAnalysisService, BatchAnalysisSettings } from '../batch-analysis.service';

@Component({
    selector: 'app-batch-analysis-banner',
    templateUrl: './batch-analysis-banner.component.html',
    styleUrls: ['./batch-analysis-banner.component.css'],
    standalone: false
})
export class BatchAnalysisBannerComponent implements OnInit {

  selectedTab: string;
  selectedTabSub: Subscription;
  showDataOptions: boolean;
  batchAnalysisSettings: BatchAnalysisSettings;
  batchAnalysisSettingsSub: Subscription;
  constructor(private batchAnalysisService: BatchAnalysisService) { }

  ngOnInit(): void {
    this.selectedTabSub = this.batchAnalysisService.selectedTab.subscribe(val => {
      this.selectedTab = val;
    });

    this.batchAnalysisSettingsSub = this.batchAnalysisService.batchAnalysisSettings.subscribe(val => {
      this.batchAnalysisSettings = val;
    });
  }

  ngOnDestroy() {
    this.selectedTabSub.unsubscribe();
    this.batchAnalysisSettingsSub.unsubscribe();
  }

  setTab(str: string) {
    this.batchAnalysisService.selectedTab.next(str);
  }

  toggleDataOptions() {
    this.showDataOptions = !this.showDataOptions;
  }

  saveSettings(){
    this.batchAnalysisService.batchAnalysisSettings.next(this.batchAnalysisSettings);
    this.batchAnalysisService.updateReplaceMotorDecision();
  }
}
