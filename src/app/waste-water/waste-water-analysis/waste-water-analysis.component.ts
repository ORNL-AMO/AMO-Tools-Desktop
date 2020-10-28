import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterAnalysisService } from './waste-water-analysis.service';

@Component({
  selector: 'app-waste-water-analysis',
  templateUrl: './waste-water-analysis.component.html',
  styleUrls: ['./waste-water-analysis.component.css']
})
export class WasteWaterAnalysisComponent implements OnInit {

  analysisTab: string;
  analysisTabSub: Subscription;
  constructor(private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit(): void {
    this.analysisTabSub = this.wasteWaterAnalysisService.analysisTab.subscribe(val => {
      this.analysisTab = val;
    })
  }

  ngOnDestroy() {
    this.analysisTabSub.unsubscribe();
  }

}
