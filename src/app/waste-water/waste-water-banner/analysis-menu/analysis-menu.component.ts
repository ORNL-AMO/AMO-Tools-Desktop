import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterAnalysisService } from '../../waste-water-analysis/waste-water-analysis.service';

@Component({
  selector: 'app-analysis-menu',
  templateUrl: './analysis-menu.component.html',
  styleUrls: ['./analysis-menu.component.css']
})
export class AnalysisMenuComponent implements OnInit {

  analysisTab: string;
  analysisTabSub: Subscription;
  constructor(private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit(): void {
    this.analysisTabSub = this.wasteWaterAnalysisService.analysisTab.subscribe(val => {
      this.analysisTab = val;
    });
  }

  ngOnDestroy() {
    this.analysisTabSub.unsubscribe();
  }

  changeTab(str: string) {
    this.wasteWaterAnalysisService.analysisTab.next(str);
  }
}
