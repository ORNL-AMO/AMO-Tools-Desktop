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
  dayTypes: { addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> };
  dayTypesSub: Subscription;

  dayTypeDaySummaries: Array<{ dayType: DayType, logToolDays: Array<LogToolDay> }>
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
      this.setDayTypeDaySummaries();
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

  setDayTypeDaySummaries() {
    let combinedDayTypes: Array<DayType> = _.union(this.dayTypes.addedDayTypes, this.dayTypes.primaryDayTypes);
    this.dayTypeDaySummaries = new Array();
    combinedDayTypes.forEach(dayType => {
      this.dayTypeDaySummaries.push({
        dayType: dayType,
        logToolDays: dayType.logToolDays
      });
    });
  }

}
