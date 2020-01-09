import { Component, OnInit } from '@angular/core';
import { DayTypeAnalysisService } from './day-type-analysis.service';
import { Subscription } from 'rxjs';
import { LogToolField } from '../log-tool.service';
import * as _ from 'lodash';
import { DayTypeGraphService } from './day-type-graph/day-type-graph.service';
import { LogToolDataService } from '../log-tool-data.service';
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
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private dayTypeGraphService: DayTypeGraphService, private logToolDataService: LogToolDataService) { }

  ngOnInit() {
    this.dataFields = this.logToolDataService.getDataFieldOptions();
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
      this.dayTypeGraphService.setDayTypeScatterPlotData();
      this.dayTypeGraphService.setIndividualDayScatterPlotData();
      this.showContent = true;
    }, 100);
  }

  ngOnDestroy() {
    this.displayDayTypeCalanderSub.unsubscribe();
    this.selectedDataFieldSub.unsubscribe();
  }

  setSelectedDataField(dataField: LogToolField) {
    this.dayTypeAnalysisService.selectedDataField.next(dataField);
    this.dayTypeAnalysisService.setDayTypeSummaries();
    this.dayTypeGraphService.setDayTypeScatterPlotData();
    this.dayTypeGraphService.setIndividualDayScatterPlotData();
    this.selectedDataFieldDropdown = false;
  }

  toggleSelectedDataFieldDropdown() {
    this.selectedDataFieldDropdown = !this.selectedDataFieldDropdown;
  }


}
