import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { LogToolField } from '../../log-tool-models';
import { LogToolDataService } from '../../log-tool-data.service';
import { DayTypeGraphService } from '../day-type-graph/day-type-graph.service';
import { VisualizeService } from '../../visualize/visualize.service';

@Component({
  selector: 'app-day-type-menu',
  templateUrl: './day-type-menu.component.html',
  styleUrls: ['./day-type-menu.component.css']
})
export class DayTypeMenuComponent implements OnInit {

  dataViewSub: Subscription;
  dataView: string;
  dataFields: Array<LogToolField>;
  selectedDataFieldDropdown: boolean = false;
  selectedDataField: LogToolField;
  selectedDataFieldSub: Subscription;
  selectedGraphType: string;
  selectedGraphTypeSub: Subscription;
  dataDisplayType: string;
  dataDisplayTypeSub: Subscription;
  showAssessmentModal: boolean = false;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, 
    private dayTypeGraphService: DayTypeGraphService,
    private visualizeService: VisualizeService) { }

  ngOnInit() {
    this.dataFields = this.visualizeService.getDataFieldOptions();
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
  }

  ngOnDestroy() {
    this.dataViewSub.unsubscribe();
    this.selectedDataFieldSub.unsubscribe();
    this.selectedGraphTypeSub.unsubscribe();
    this.dataDisplayTypeSub.unsubscribe();
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
