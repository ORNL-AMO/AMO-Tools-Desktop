import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { ExplorerData, LogToolField } from '../../log-tool-models';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';
import { VisualizeService } from '../../visualize/visualize.service';
import { LogToolDataService } from '../../log-tool-data.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-day-type-menu',
  templateUrl: './day-type-menu.component.html',
  styleUrls: ['./day-type-menu.component.css']
})
export class DayTypeMenuComponent implements OnInit {

  dataViewSub: Subscription;
  dataView: string;
  dataFieldOptions: Array<LogToolField>;
  selectedDataFieldDropdown: boolean = false;
  selectedDataField: LogToolField;
  selectedDataFieldSub: Subscription;
  selectedGraphType: string;
  selectedGraphTypeSub: Subscription;
  dataDisplayType: string;
  dataDisplayTypeSub: Subscription;
  showAssessmentModal: boolean = false;
  explorerDataSubscription: Subscription;

  explorerData: ExplorerData;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, 
    private dayTypeGraphService: DayTypeGraphService,
    private logToolDataService: LogToolDataService,
    private visualizeService: VisualizeService) { }

  ngOnInit() {
    this.setGraphDataOptions();
    this.dataViewSub = this.dayTypeAnalysisService.dataView.subscribe(val => {
      this.dataView = val;
    });
    this.selectedDataFieldSub = this.dayTypeAnalysisService.selectedDataField.subscribe(val => {
      this.selectedDataField = val;
    });
    this.selectedGraphTypeSub = this.dayTypeGraphService.selectedGraphType.subscribe(val => {
      this.selectedGraphType = val;
    });
    this.dataDisplayTypeSub = this.dayTypeAnalysisService.dataDisplayType.subscribe(displayType => {
      this.dataDisplayType = displayType;
    });
    this.explorerDataSubscription = this.logToolDataService.explorerData.subscribe(explorerData => {
      this.explorerData = explorerData;
      this.setGraphDataOptions();
    });
  }

  ngOnDestroy() {
    this.dataViewSub.unsubscribe();
    this.selectedDataFieldSub.unsubscribe();
    this.selectedGraphTypeSub.unsubscribe();
    this.dataDisplayTypeSub.unsubscribe();
    this.explorerDataSubscription.unsubscribe();
  }

  setGraphDataOptions() {
    if (this.explorerData) {
      let fields: Array<LogToolField> = _.flatMap(this.explorerData.datasets, dataset => { return dataset.fields });
      fields = fields.filter(field => !field.isDateField && field.useForDayTypeAnalysis == true);
      fields = this.visualizeService.filterFieldsForPresentation(fields, true);
      fields.unshift({
        fieldName: 'all',
        alias: 'Total Aggregated Equipment Data',
        useField: true,
        useForDayTypeAnalysis: true,
        isDateField: undefined,
        isTimeField: undefined,
        unit: undefined,
        invalidField: undefined,
        csvId: undefined,
        csvName: undefined,
        fieldId: 'all'
      });
      this.dataFieldOptions = fields;
    } else {
      this.dataFieldOptions = this.visualizeService.getDataFieldOptions(true);
    }
  }

  changeDataView(str: string) {
    this.dayTypeAnalysisService.dataView.next(str);
  }

  toggleSelectedDataFieldDropdown() {
    this.selectedDataFieldDropdown = !this.selectedDataFieldDropdown;
  }

  setSelectedDataField(dataField: LogToolField) {
    this.dayTypeAnalysisService.selectedDataField.next(dataField);
    this.dayTypeAnalysisService.setDayTypeSummaries();
    this.dayTypeGraphService.setDayTypeScatterPlotData();
    this.dayTypeGraphService.setIndividualDayScatterPlotData();
    this.selectedDataFieldDropdown = false;
  }

  setSelectedGraphType(str: string) {
    this.dayTypeGraphService.selectedGraphType.next(str);
  }

  setDataDisplayType(str: string) {
    this.dayTypeAnalysisService.dataDisplayType.next(str);
  }

  applyToAssessment(){
    this.showAssessmentModal = true;
  }

  hideAssessmentModal(){
    this.showAssessmentModal = false;
  }
}
