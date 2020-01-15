import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { DayTypeSummary, LogToolField, DayType, LogToolDay } from '../../log-tool-models';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
@Component({
  selector: 'app-day-type-table',
  templateUrl: './day-type-table.component.html',
  styleUrls: ['./day-type-table.component.css']
})
export class DayTypeTableComponent implements OnInit {

  dayTypeSummaries: Array<DayTypeSummary>;
  dayTypeSummariesSub: Subscription;

  selectedDataFieldSub: Subscription;
  selectedDataField: LogToolField;
  dayTypes: Array<DayType>;
  dayTypesSub: Subscription;

  dayTypeDaySummaries: Array<{ dayType: DayType, logToolDays: Array<LogToolDay> }>
  hourLabels: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.dayTypeSummariesSub = this.dayTypeAnalysisService.dayTypeSummaries.subscribe(dayTypeSummaries => {
      this.dayTypeSummaries = dayTypeSummaries;
    });

    this.selectedDataFieldSub = this.dayTypeAnalysisService.selectedDataField.subscribe(val => {
      this.selectedDataField = val;
    });
    this.dayTypesSub = this.dayTypeAnalysisService.dayTypes.subscribe(dayTypes => {
      this.dayTypes = dayTypes;
    });
  }

  ngOnDestroy() {
    this.dayTypeSummariesSub.unsubscribe();
    this.selectedDataFieldSub.unsubscribe();
    this.dayTypesSub.unsubscribe();
  }

  getAverageValue(averages: Array<{ value: number, field: LogToolField }>): number {
    return _.find(averages, (average) => { return average.field.fieldName == this.selectedDataField.fieldName }).value;
  }
}
