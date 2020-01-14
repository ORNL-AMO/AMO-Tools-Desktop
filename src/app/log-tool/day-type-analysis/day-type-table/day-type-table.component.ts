import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { DayTypeSummary, LogToolField } from '../../log-tool-models';
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
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.dayTypeSummariesSub = this.dayTypeAnalysisService.dayTypeSummaries.subscribe(dayTypeSummaries => {
      this.dayTypeSummaries = dayTypeSummaries;
    });

    this.selectedDataFieldSub = this.dayTypeAnalysisService.selectedDataField.subscribe(val => {
      this.selectedDataField = val;
    });
  }

  ngOnDestroy() {
    this.dayTypeSummariesSub.unsubscribe();
  }

  getAverageValue(averages: Array<{ value: number, field: LogToolField }>): number {
    return _.find(averages, (average) => { return average.field.fieldName == this.selectedDataField.fieldName }).value;
  }

}
