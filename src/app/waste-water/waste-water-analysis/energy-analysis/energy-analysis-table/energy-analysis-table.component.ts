import { Component, Input, OnInit } from '@angular/core';
import { WasteWaterResults } from '../../../../shared/models/waste-water';
import { WasteWaterAnalysisService } from '../../waste-water-analysis.service';
import { Settings } from '../../../../shared/models/settings';
import { WasteWaterService } from '../../../waste-water.service';

@Component({
    selector: 'app-energy-analysis-table',
    templateUrl: './energy-analysis-table.component.html',
    styleUrls: ['./energy-analysis-table.component.css'],
    standalone: false
})
export class EnergyAnalysisTableComponent implements OnInit {
  @Input()
  settings: Settings;

  baselineResults: WasteWaterResults;
  modificationsResultsArr: Array<{
    name: string,
    results: WasteWaterResults,
  }>;
  

  constructor(private wasteWaterAnalysisService: WasteWaterAnalysisService, private wasteWaterService: WasteWaterService) { }

  ngOnInit() {
    if(!this.settings){
      this.settings = this.wasteWaterService.settings.getValue();
    }    
    this.baselineResults = this.wasteWaterAnalysisService.baselineResults;
    this.modificationsResultsArr = this.wasteWaterAnalysisService.modificationsResultsArr;
  }

}
