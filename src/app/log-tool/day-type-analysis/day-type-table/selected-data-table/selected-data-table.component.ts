import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LogToolField, DayTypeSummary, DayType, LogToolDay, AverageByInterval } from '../../../log-tool-models';
import { Subscription } from 'rxjs';
import { DayTypeAnalysisService } from '../../day-type-analysis.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-selected-data-table',
  templateUrl: './selected-data-table.component.html',
  styleUrls: ['./selected-data-table.component.css']
})
export class SelectedDataTableComponent implements OnInit {

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
  intervalDisplayStrings: Array<string> = [];
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
      if (this.dayTypes && this.dayTypes.length > 0) {
        this.intervalDisplayStrings = this.dayTypes[0].logToolDays[0].dayAveragesByInterval.map(average => average.intervalDisplayString);
      }
    });
    
  }

  ngOnDestroy() {
    this.dayTypeSummariesSub.unsubscribe();
    this.selectedDataFieldSub.unsubscribe();
    this.dayTypesSub.unsubscribe();
  }

  getAverageValue(averages: Array<{ value: number, field: LogToolField }>): number {
    let average = _.find(averages, (average) => { return average.field.fieldName == this.selectedDataField.fieldName });
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
