import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { DayTypeSummary, LogToolField, DayType, LogToolDay } from '../../log-tool-models';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { LogToolDataService } from '../../log-tool-data.service';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';
@Component({
  selector: 'app-day-type-table',
  templateUrl: './day-type-table.component.html',
  styleUrls: ['./day-type-table.component.css']
})
export class DayTypeTableComponent implements OnInit {

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  table1String: any;


  dayTypeSummaries: Array<DayTypeSummary>;
  dayTypeSummariesSub: Subscription;

  selectedDataFieldSub: Subscription;
  selectedDataField: LogToolField;
  dayTypes: Array<DayType>;
  dayTypesSub: Subscription;

  dayTypeDaySummaries: Array<{ dayType: DayType, logToolDays: Array<LogToolDay> }>
  hourLabels: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  fields: Array<LogToolField>;
  selectedGraphType: string;
  selectedGraphTypeSub: Subscription;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private logToolDataService: LogToolDataService, private dayTypeGraphService: DayTypeGraphService) { }

  ngOnInit() {

    this.fields = this.logToolDataService.getDataFieldOptions();
    this.dayTypeSummariesSub = this.dayTypeAnalysisService.dayTypeSummaries.subscribe(dayTypeSummaries => {
      this.dayTypeSummaries = dayTypeSummaries;
      console.log(this.dayTypeSummaries);
    });

    this.selectedDataFieldSub = this.dayTypeAnalysisService.selectedDataField.subscribe(val => {
      this.selectedDataField = val;
    });
    this.dayTypesSub = this.dayTypeAnalysisService.dayTypes.subscribe(dayTypes => {
      this.dayTypes = dayTypes;
    });

    this.selectedGraphTypeSub = this.dayTypeGraphService.selectedGraphType.subscribe(val => {
      this.selectedGraphType = val;
    });
  }

  ngOnDestroy() {
    this.dayTypeSummariesSub.unsubscribe();
    this.selectedDataFieldSub.unsubscribe();
    this.dayTypesSub.unsubscribe();
    this.selectedGraphTypeSub.unsubscribe();
  }

  getAverageValue(averages: Array<{ value: number, field: LogToolField }>, field: LogToolField): number {
    let average = _.find(averages, (average) => { return average.field.fieldName == field.fieldName });
    if (average) {
      return average.value;
    }
    return;
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }

  updateTable1String() {
    this.table1String = this.copyTable1.nativeElement.innerText;
  }
}
