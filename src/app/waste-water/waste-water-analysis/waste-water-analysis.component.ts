import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { WasteWater } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';
import { WasteWaterAnalysisService } from './waste-water-analysis.service';

@Component({
  selector: 'app-waste-water-analysis',
  templateUrl: './waste-water-analysis.component.html',
  styleUrls: ['./waste-water-analysis.component.css']
})
export class WasteWaterAnalysisComponent implements OnInit {
  @Input()
  containerHeight: number;

  analysisTab: string;
  analysisTabSub: Subscription;
  constructor(private wasteWaterService: WasteWaterService, private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit(): void {
    this.analysisTabSub = this.wasteWaterAnalysisService.analysisTab.subscribe(val => {
      this.analysisTab = val;
    });
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let settings: Settings = this.wasteWaterService.settings.getValue();
    this.wasteWaterAnalysisService.setResults(wasteWater, settings);
    this.wasteWaterAnalysisService.initXAxisVariables();
    this.wasteWaterAnalysisService.setGraphData();
    this.wasteWaterAnalysisService.selectedTableData.next({
      name: 'Baseline',
      results: this.wasteWaterAnalysisService.baselineResults
    });
  }

  ngOnDestroy() {
    this.analysisTabSub.unsubscribe();
  }

}
