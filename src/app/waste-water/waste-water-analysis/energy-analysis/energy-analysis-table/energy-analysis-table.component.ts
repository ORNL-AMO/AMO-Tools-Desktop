import { Component, OnInit } from '@angular/core';
import { WasteWaterResults } from '../../../../shared/models/waste-water';
import { WasteWaterAnalysisService } from '../../waste-water-analysis.service';

@Component({
  selector: 'app-energy-analysis-table',
  templateUrl: './energy-analysis-table.component.html',
  styleUrls: ['./energy-analysis-table.component.css']
})
export class EnergyAnalysisTableComponent implements OnInit {

  baselineResults: WasteWaterResults;
  modificationsResultsArr: Array<{
    name: string,
    results: WasteWaterResults,
  }>;

  constructor(private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit(): void {
    this.baselineResults = this.wasteWaterAnalysisService.baselineResults;
    this.modificationsResultsArr = this.wasteWaterAnalysisService.modificationsResultsArr;
  }

}
