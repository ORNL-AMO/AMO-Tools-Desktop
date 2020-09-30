import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DayTypeSummary, LogToolField } from '../../../log-tool-models';
import { Subscription } from 'rxjs';
import { DayTypeAnalysisService } from '../../day-type-analysis.service';
import * as _ from 'lodash';
import { LogToolDataService } from '../../../log-tool-data.service';

@Component({
  selector: 'app-day-type-summary-table',
  templateUrl: './day-type-summary-table.component.html',
  styleUrls: ['./day-type-summary-table.component.css']
})
export class DayTypeSummaryTableComponent implements OnInit {

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  
  dayTypeSummaries: Array<DayTypeSummary>;
  dayTypeSummariesSub: Subscription;
  fields: Array<LogToolField>;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private logToolDataService: LogToolDataService) { }

  ngOnInit(): void {
    this.fields = this.logToolDataService.getDataFieldOptions();
    this.dayTypeSummariesSub = this.dayTypeAnalysisService.dayTypeSummaries.subscribe(dayTypeSummaries => {
      this.dayTypeSummaries = dayTypeSummaries;
    });
  }

  ngOnDestroy(){
    this.dayTypeSummariesSub.unsubscribe();
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
}
