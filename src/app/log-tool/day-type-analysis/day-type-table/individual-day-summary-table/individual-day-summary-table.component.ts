import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { LogToolField, DayType } from '../../../log-tool-models';
import { DayTypeAnalysisService } from '../../day-type-analysis.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { VisualizeService } from '../../../visualize/visualize.service';

@Component({
    selector: 'app-individual-day-summary-table',
    templateUrl: './individual-day-summary-table.component.html',
    styleUrls: ['./individual-day-summary-table.component.css'],
    standalone: false
})
export class IndividualDaySummaryTableComponent implements OnInit {
  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;


  fields: Array<LogToolField>;
  dayTypesSub: Subscription;
  dayTypes: Array<DayType>;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private visualizeService: VisualizeService) { }

  ngOnInit(): void {
    this.fields = this.visualizeService.getDataFieldOptions();
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
