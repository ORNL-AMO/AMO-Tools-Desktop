import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from './day-type-analysis.service';
import { Subscription } from 'rxjs';
import { LogToolField } from '../log-tool.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-day-type-analysis',
  templateUrl: './day-type-analysis.component.html',
  styleUrls: ['./day-type-analysis.component.css']
})
export class DayTypeAnalysisComponent implements OnInit {

  showContent: boolean = false;
  displayDayTypeCalanderSub: Subscription;
  displayDayTypeCalander: boolean;
  dataFields: Array<LogToolField>;
  selectedDataFieldDropdown: boolean = false;

  selectedDataField: LogToolField;
  selectedDataFieldSub: Subscription;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.dataFields = this.dayTypeAnalysisService.getDataFieldOptions();
    this.dayTypeAnalysisService.setStartDateAndNumberOfMonths();
    this.displayDayTypeCalanderSub = this.dayTypeAnalysisService.displayDayTypeCalander.subscribe(val => {
      this.displayDayTypeCalander = val;
    });

    this.selectedDataFieldSub = this.dayTypeAnalysisService.selectedDataField.subscribe(val => {
      this.selectedDataField = val;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dayTypeAnalysisService.getDaySummaries();
      this.dayTypeAnalysisService.initSecondaryDayTypes();
      this.dayTypeAnalysisService.setDayTypeSummaries();
      this.showContent = true;
    }, 100);
  }

  ngOnDestroy() {
    this.displayDayTypeCalanderSub.unsubscribe();
    this.selectedDataFieldSub.unsubscribe();
  }

  setSelectedDataField(dataField: LogToolField) {
    this.dayTypeAnalysisService.selectedDataField.next(dataField);
    this.selectedDataFieldDropdown = false;
  }

  toggleSelectedDataFieldDropdown() {
    this.selectedDataFieldDropdown = !this.selectedDataFieldDropdown;
  }


}
