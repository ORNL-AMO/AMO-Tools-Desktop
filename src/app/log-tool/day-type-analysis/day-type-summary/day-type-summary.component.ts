import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService, DaySummary } from '../day-type-analysis.service';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';

@Component({
  selector: 'app-day-type-summary',
  templateUrl: './day-type-summary.component.html',
  styleUrls: ['./day-type-summary.component.css']
})
export class DayTypeSummaryComponent implements OnInit {

  daySummaries: Array<DaySummary>;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private dayTypeGraphService: DayTypeGraphService) { }

  ngOnInit() {
    this.daySummaries = this.dayTypeAnalysisService.daySummaries;
  }


  getDateColor(daySummary: DaySummary): string{
    return this.dayTypeGraphService.getDateColor(daySummary);
  }

}
