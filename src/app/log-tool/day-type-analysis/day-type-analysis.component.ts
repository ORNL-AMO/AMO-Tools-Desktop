import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DayTypeAnalysisService } from './day-type-analysis.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { DayTypeGraphService } from './day-type-graph/day-type-graph.service';
import { LogToolDataService } from '../log-tool-data.service';
import { LogToolField } from '../log-tool-models';
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

  dataViewSub: Subscription;
  dataView: string;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private dayTypeGraphService: DayTypeGraphService, private logToolDataService: LogToolDataService,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.dataFields = this.logToolDataService.getDataFieldOptions();
    this.dayTypeAnalysisService.setStartDateAndNumberOfMonths();
    this.displayDayTypeCalanderSub = this.dayTypeAnalysisService.displayDayTypeCalander.subscribe(val => {
      this.displayDayTypeCalander = val;
    });

    this.selectedDataFieldSub = this.dayTypeAnalysisService.selectedDataField.subscribe(val => {
      this.selectedDataField = val;
    });
    this.dataViewSub = this.dayTypeAnalysisService.dataView.subscribe(val => {
      this.dataView = val;
    });
  }

  ngAfterViewInit() {
    if (this.dayTypeAnalysisService.dayTypesCalculated == false) {
      setTimeout(() => {
        this.dayTypeAnalysisService.getDaySummaries();
        this.dayTypeAnalysisService.initSecondaryDayTypes();
        this.dayTypeAnalysisService.setDayTypeSummaries();
        this.dayTypeGraphService.setDayTypeScatterPlotData();
        this.dayTypeGraphService.setIndividualDayScatterPlotData();
        this.showContent = true;
        this.dayTypeAnalysisService.dayTypesCalculated = true;
      }, 100);
    } else {
      this.showContent = true;
      this.cd.detectChanges();
    }

  }

  ngOnDestroy() {
    this.displayDayTypeCalanderSub.unsubscribe();
    this.selectedDataFieldSub.unsubscribe();
    this.dataViewSub.unsubscribe();
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

  changeDataView(str: string) {
    this.dayTypeAnalysisService.dataView.next(str);
  }
}
