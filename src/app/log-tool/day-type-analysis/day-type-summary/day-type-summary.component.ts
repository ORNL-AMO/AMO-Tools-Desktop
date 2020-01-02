import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService, DaySummary, DayTypeSummary, DayType } from '../day-type-analysis.service';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
@Component({
  selector: 'app-day-type-summary',
  templateUrl: './day-type-summary.component.html',
  styleUrls: ['./day-type-summary.component.css']
})
export class DayTypeSummaryComponent implements OnInit {

  daySummaries: Array<DaySummary>;
  dayTypeSummariesSub: Subscription;
  dayTypeSummaries: Array<DayTypeSummary>;
  dayTypesSub: Subscription;
  dayTypeSummaryAverages: Array<{ dayType: DayType, average: number }>;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private dayTypeGraphService: DayTypeGraphService) { }

  ngOnInit() {
    this.daySummaries = this.dayTypeAnalysisService.daySummaries;
    this.dayTypesSub = this.dayTypeAnalysisService.dayTypes.subscribe(val => {
      this.dayTypeAnalysisService.setDayTypeSummaries();
    });;
    this.dayTypeSummariesSub = this.dayTypeAnalysisService.dayTypeSummaries.subscribe(val => {
      this.dayTypeSummaries = val;
      if (this.dayTypeSummaries == undefined) {
        this.dayTypeAnalysisService.setDayTypeSummaries();
      }
      console.log(this.dayTypeSummaries)
      this.setDayTypeSummaryAverages();
    });
  }

  ngOnDestroy() {
    this.dayTypeSummariesSub.unsubscribe();
    this.dayTypesSub.unsubscribe();
  }


  getDateColor(daySummary: DaySummary): string {
    return this.dayTypeGraphService.getDateColor(daySummary);
  }

  setDayTypeSummaryAverages() {
    this.dayTypeSummaryAverages = new Array();
    this.dayTypeSummaries.forEach(summary => {
      let average: number = _.meanBy(summary.data, this.dayTypeGraphService.selectedDataField.getValue());
      this.dayTypeSummaryAverages.push(
        {
          dayType: summary.dayType,
          average: average
        }
      )
    })
  }

}
