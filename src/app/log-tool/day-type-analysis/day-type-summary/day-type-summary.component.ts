import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService, DaySummary, DayTypeSummary, DayType } from '../day-type-analysis.service';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { LogToolService, LogToolField } from '../../log-tool.service';
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
  selectedGraphTypeSub: Subscription;
  selectedGraphType: string;
  selectedDataFieldSub: Subscription;
  selectedDataField: LogToolField;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private dayTypeGraphService: DayTypeGraphService, private logToolService: LogToolService) { }

  ngOnInit() {
    this.selectedDataFieldSub = this.dayTypeAnalysisService.selectedDataField.subscribe(field => {
      this.selectedDataField = field;
      if (this.dayTypeSummaries) {
        this.setDayTypeSummaryAverages();
      }
    });
    this.daySummaries = this.dayTypeAnalysisService.daySummaries;

    this.dayTypesSub = this.dayTypeAnalysisService.dayTypes.subscribe(val => {
      this.dayTypeAnalysisService.setDayTypeSummaries();
    });

    this.dayTypeSummariesSub = this.dayTypeAnalysisService.dayTypeSummaries.subscribe(val => {
      this.dayTypeSummaries = val;
      this.setDayTypeSummaryAverages();
    });

    this.selectedGraphTypeSub = this.dayTypeGraphService.selectedGraphType.subscribe(val => {
      this.selectedGraphType = val;
    });
  }

  ngOnDestroy() {
    this.dayTypeSummariesSub.unsubscribe();
    this.dayTypesSub.unsubscribe();
    this.selectedGraphTypeSub.unsubscribe();
    this.selectedDataFieldSub.unsubscribe();
  }


  getDateColor(daySummary: DaySummary): string {
    return this.dayTypeGraphService.getDateColorFromDaySummary(daySummary);
  }

  setDayTypeSummaryAverages() {
    this.dayTypeSummaryAverages = new Array();
    this.dayTypeSummaries.forEach(summary => {
      let average: number = _.meanBy(summary.data, this.selectedDataField.fieldName);
      this.dayTypeSummaryAverages.push(
        {
          dayType: summary.dayType,
          average: average
        }
      )
    })
  }

  showDayTypeGraph() {
    this.dayTypeGraphService.selectedGraphType.next('dayType');
  }

  showDailyGraph() {
    this.dayTypeGraphService.selectedGraphType.next('daily');
  }

  getAverageDataItem(daySummary: DaySummary): { field: LogToolField, value: number } {
    return _.find(daySummary.averages, (averageObj) => { return averageObj.field.fieldName == this.selectedDataField.fieldName });
  }
}
