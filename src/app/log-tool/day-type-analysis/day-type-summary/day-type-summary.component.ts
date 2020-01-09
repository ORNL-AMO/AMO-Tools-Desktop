import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService, DaySummary, DayTypeSummary } from '../day-type-analysis.service';
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
  selectedGraphTypeSub: Subscription;
  selectedGraphType: string;
  selectedDataFieldSub: Subscription;
  selectedDataField: LogToolField;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private dayTypeGraphService: DayTypeGraphService) { }

  ngOnInit() {
    //never change, just color changes
    this.daySummaries = this.dayTypeAnalysisService.daySummaries;
    this.selectedDataFieldSub = this.dayTypeAnalysisService.selectedDataField.subscribe(field => {
      this.selectedDataField = field;
    });

    this.dayTypeSummariesSub = this.dayTypeAnalysisService.dayTypeSummaries.subscribe(val => {
      this.dayTypeSummaries = val;
    });

    this.selectedGraphTypeSub = this.dayTypeGraphService.selectedGraphType.subscribe(val => {
      this.selectedGraphType = val;
    });
  }

  ngOnDestroy() {
    this.dayTypeSummariesSub.unsubscribe();
    this.selectedGraphTypeSub.unsubscribe();
    this.selectedDataFieldSub.unsubscribe();
  }


  getDateColor(daySummary: DaySummary): string {
    return this.dayTypeGraphService.getDateColorFromDaySummary(daySummary);
  }

  showDayTypeGraph() {
    this.dayTypeGraphService.selectedGraphType.next('dayType');
  }

  showDailyGraph() {
    this.dayTypeGraphService.selectedGraphType.next('daily');
  }

  getAverageDataItem(daySummary: DaySummary | DayTypeSummary): { field: LogToolField, value: number } {
    return _.find(daySummary.averages, (averageObj) => { return averageObj.field.fieldName == this.selectedDataField.fieldName });
  }
}
