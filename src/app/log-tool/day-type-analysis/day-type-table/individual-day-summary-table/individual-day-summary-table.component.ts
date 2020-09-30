import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { LogToolField, DayType } from '../../../log-tool-models';
import { LogToolDataService } from '../../../log-tool-data.service';
import { DayTypeAnalysisService } from '../../day-type-analysis.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-individual-day-summary-table',
  templateUrl: './individual-day-summary-table.component.html',
  styleUrls: ['./individual-day-summary-table.component.css']
})
export class IndividualDaySummaryTableComponent implements OnInit {
  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;


  fields: Array<LogToolField>;
  dayTypesSub: Subscription;
  dayTypes: Array<DayType>;
  constructor(private logToolDataService: LogToolDataService, private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit(): void {
    this.fields = this.logToolDataService.getDataFieldOptions();
    this.dayTypesSub = this.dayTypeAnalysisService.dayTypes.subscribe(dayTypes => {
      this.dayTypes = dayTypes;
    });
  }

  ngOnDestroy() {
    this.dayTypesSub.unsubscribe();
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
